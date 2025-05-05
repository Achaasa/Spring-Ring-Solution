import { PrismaClient } from "@prisma/client";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";
import {
  notificationSchema,
  updateNotificationSchema,
} from "../zodSchema/notificationSchema";

const prismaClient = new PrismaClient();

export const createNotification = async (notificationData: {
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
}) => {
  try {
    // Check if user exists
    const user = await prismaClient.user.findUnique({
      where: { id: notificationData.userId },
    });

    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    const newNotification = await prismaClient.notification.create({
      data: notificationData,
      include: {
        user: true,
      },
    });
    return newNotification;
  } catch (error) {
    throw new HttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      formatPrismaError(error),
    );
  }
};

export const getNotifications = async (userId: string) => {
  try {
    const notifications = await prismaClient.notification.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notifications;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getNotificationById = async (id: string) => {
  try {
    const notification = await prismaClient.notification.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
    if (!notification) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Notification not found.");
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
    const validateNotification =
      updateNotificationSchema.safeParse(notificationData);
    if (!validateNotification.success) {
      const errors = validateNotification.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const findNotification = await prismaClient.notification.findUnique({
      where: { id },
    });
    if (!findNotification) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Notification not found");
    }

    const updatedNotification = await prismaClient.notification.update({
      where: { id },
      data: notificationData,
      include: {
        user: true,
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
      throw new HttpException(
        HttpStatus.NOT_FOUND,
        "Notification does not exist",
      );
    }

    await prismaClient.notification.delete({ where: { id } });
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const notification = await prismaClient.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return notification;
  } catch (error) {
    throw new HttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      formatPrismaError(error),
    );
  }
};
