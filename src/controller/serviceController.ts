import { Request, Response } from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "../helper/serviceHelper";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";

export const createServiceHandler = async (req: Request, res: Response) => {
  try {
    const service = await createService(req.body);
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
  try {
    const { id } = req.params;
    const service = await updateService(id, req.body);
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
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
