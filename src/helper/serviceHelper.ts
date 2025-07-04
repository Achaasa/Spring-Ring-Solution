import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { serviceSchema, updateServiceSchema } from "../zodSchema/serviceSchema";
import { formatPrismaError } from "../utils/formatPrisma";
import { Service } from "@prisma/client";

export const createService = async (serviceData: Service) => {
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
    });
    if (!findService) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Service not found");
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
