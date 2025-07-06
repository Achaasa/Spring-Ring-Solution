import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { Notification } from "@prisma/client";
import { notificationSchema } from "../zodSchema/notificationSchema";
import { formatPrismaError } from "../utils/formatPrisma";
import { userSelectFields } from "../utils/userSelect";

export const createNotification = async (notificationData: Notification) => {
  try {
    const validateNotification = notificationSchema.safeParse(notificationData);
    if (!validateNotification.success) {
      const errors = validateNotification.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: notificationData.userId },
    });

    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    const newNotification = await prisma.notification.create({
      data: notificationData,
      include: {
        user: {
          select: userSelectFields,
        },
      },
    });
    return newNotification;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw formatPrismaError(error);
  }
};

export const getNotifications = async (userId: string) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        user: {
          select: userSelectFields,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return notifications;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getNotificationById = async (id: string) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: userSelectFields,
        },
      },
    });
    if (!notification) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Notification not found");
    }
    return notification;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const updateNotification = async (
  id: string,
  notificationData: Partial<Notification>,
) => {
  try {
    const validateNotification = notificationSchema
      .partial()
      .safeParse(notificationData);
    if (!validateNotification.success) {
      const errors = validateNotification.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const findNotification = await prisma.notification.findUnique({
      where: { id },
    });
    if (!findNotification) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Notification not found");
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: notificationData,
      include: {
        user: {
          select: userSelectFields,
        },
      },
    });
    return updatedNotification;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deleteNotification = async (id: string) => {
  try {
    const findNotification = await getNotificationById(id);
    if (!findNotification) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Notification not found");
    }
    await prisma.notification.delete({
      where: { id },
    });
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Notification not found");
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: {
        user: {
          select: userSelectFields,
        },
      },
    });

    return updatedNotification;
  } catch (error) {
    throw formatPrismaError(error);
  }
};
