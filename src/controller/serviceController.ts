import { Request, Response } from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  deleteServiceImagesByIds,
} from "../helper/serviceHelper";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";
import { Service } from "@prisma/client";
import cloudinary from "../utils/cloudinary";

export const createServiceHandler = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const serviceData: Service = req.body;
  const pictures = [];
  const uploadedImages = [];
  try {
    if (files.photos && files.photos.length > 0) {
      for (const photo of files.photos) {
        const uploaded = await cloudinary.uploader.upload(photo.path, {
          folder: "/springSolution/service/photos/",
        });

        if (uploaded) {
          pictures.push({
            imageUrl: uploaded.secure_url,
            imageKey: uploaded.public_id,
          });
          uploadedImages.push(uploaded.public_id);
        }
      }
    }
    const service = await createService(serviceData, pictures);
    res.status(HttpStatus.CREATED).json(service);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getServicesHandler = async (req: Request, res: Response) => {
  try {
    const services = await getServices();
    res.status(HttpStatus.OK).json(services);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getServiceByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await getServiceById(id);
    res.status(HttpStatus.OK).json(service);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const updateServiceHandler = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const serviceData: Service = req.body;
  const pictures = [];
  const uploadedImages = [];
  const { id } = req.params;

  try {
    if (files.photos && files.photos.length > 0) {
      for (const photo of files.photos) {
        const uploaded = await cloudinary.uploader.upload(photo.path, {
          folder: "springSolution/service/photos/",
        });

        if (uploaded) {
          pictures.push({
            imageUrl: uploaded.secure_url,
            imageKey: uploaded.public_id,
          });
          uploadedImages.push(uploaded.public_id);
        }
      }
    }
    const service = await updateService(id, serviceData, pictures);
    res.status(HttpStatus.OK).json(service);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const deleteServiceHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteService(id);
    res.status(HttpStatus.OK).send("deleted successfully");
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};


export const deleteServiceImagesHandler = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const { imageIds } = req.body;

  try {
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        "You must provide a non-empty array of image IDs."
      );
    }

    const result = await deleteServiceImagesByIds(serviceId, imageIds);
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
