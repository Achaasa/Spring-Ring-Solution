import { Request, Response } from "express";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
} from "../helper/notificationHelper";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";

export const createNotificationHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const notification = await createNotification(req.body);
    res.status(HttpStatus.CREATED).json(notification);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getNotificationsHandler = async (req: Request, res: Response) => {
  try {
    const {userId}= req.params
    const notifications = await getNotifications(userId);
    res.status(HttpStatus.OK).json(notifications);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getNotificationByIdHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const notification = await getNotificationById(id);
    res.status(HttpStatus.OK).json(notification);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const updateNotificationHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const notification = await updateNotification(id, req.body);
    res.status(HttpStatus.OK).json(notification);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const deleteNotificationHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    await deleteNotification(id);
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const markNotificationAsReadHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationAsRead(id);
    res.status(HttpStatus.OK).json(notification);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
