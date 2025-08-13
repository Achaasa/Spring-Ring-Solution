import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { serviceSchema, updateServiceSchema } from "../zodSchema/serviceSchema";
import { formatPrismaError } from "../utils/formatPrisma";
import { Service } from "@prisma/client";
import cloudinary from "../utils/cloudinary";

export const createService = async (
  serviceData: Service,
  pictures: { imageUrl: string; imageKey: string }[],
) => {
  try {
    const validateService = serviceSchema.safeParse(serviceData);
    if (!validateService.success) {
      const errors = validateService.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }
    const existingService = await prisma.service.findFirst({
      where: { name: serviceData.name, type: serviceData.type, delFlag: false },
    });
    if (existingService) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        "Service with this name and type already exists.",
      );
    }
    const newService = await prisma.service.create({
      data: serviceData,
    });
    // Handle hostel images
    if (pictures.length > 0) {
      const serviceImage = pictures.map((picture) => ({
        imageUrl: picture.imageUrl,
        imageKey: picture.imageKey,
        serviceId: newService.id,
      }));
      await prisma.serviceImages.createMany({ data: serviceImage });
    }
    return newService;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getServices = async () => {
  try {
    const services = await prisma.service.findMany({
      where: { delFlag: false },
    });
    return services;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getServiceById = async (id: string) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id, delFlag: false },
    });
    if (!service) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Service not found.");
    }
    return service;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const updateService = async (
  id: string,
  serviceData: Partial<Service>,
  pictures: { imageUrl: string; imageKey: string }[],
) => {
  try {
    const validateService = updateServiceSchema.safeParse(serviceData);
    if (!validateService.success) {
      const errors = validateService.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const findService = await prisma.service.findUnique({
      where: { id, delFlag: false },
      include: { ServiceImages: true },
    });
    if (!findService) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Service not found");
    }

    // Handle photos update only if new pictures are provided
    if (pictures.length > 0) {
      // Delete old images from Cloudinary
      for (const image of findService.ServiceImages || []) {
        if (image.imageKey) {
          try {
            await cloudinary.uploader.destroy(image.imageKey);
          } catch (e) {
            console.warn(
              "Failed to delete image from Cloudinary:",
              image.imageKey,
              e,
            );
          }
        }
      }

      // Delete image records from database
      await prisma.serviceImages.deleteMany({
        where: { id },
      });

      // Add new image records
      const serviceImages = pictures.map((picture) => ({
        imageUrl: picture.imageUrl,
        imageKey: picture.imageKey,
        serviceId: id,
      }));
      await prisma.serviceImages.createMany({ data: serviceImages });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: serviceData,
    });
    return updatedService;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deleteService = async (id: string) => {
  try {
    const findService = await getServiceById(id);
    if (!findService) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Service does not exist");
    }

    await prisma.service.update({ where: { id }, data: { delFlag: true } });
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deleteServiceImagesByIds = async (
  serviceId: string,
  imageIds: string[],
) => {
  try {
    if (!imageIds || imageIds.length === 0) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        "No image IDs provided for deletion.",
      );
    }

    // Fetch the images and make sure they belong to the specified service
    const imagesToDelete = await prisma.serviceImages.findMany({
      where: {
        id: { in: imageIds },
        serviceId: serviceId,
      },
    });

    // Check for invalid image IDs (i.e., not found or don't belong to the service)
    const foundImageIds = imagesToDelete.map((img) => img.id);
    const invalidIds = imageIds.filter((id) => !foundImageIds.includes(id));

    if (invalidIds.length > 0) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        `The following image IDs are invalid or do not belong to the service: ${invalidIds.join(
          ", ",
        )}`,
      );
    }

    // Delete images from Cloudinary
    for (const image of imagesToDelete) {
      if (image.imageKey) {
        try {
          await cloudinary.uploader.destroy(image.imageKey);
        } catch (err) {
          console.warn(
            `Failed to delete image with key ${image.imageKey} from Cloudinary`,
            err,
          );
        }
      }
    }

    // Delete from database
    await prisma.serviceImages.deleteMany({
      where: { id: { in: imageIds } },
    });

    return { message: "Selected images deleted successfully." };
  } catch (error) {
    throw formatPrismaError(error);
  }
};
