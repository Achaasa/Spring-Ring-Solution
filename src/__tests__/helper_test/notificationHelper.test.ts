import { Notification } from "@prisma/client";
import * as notificationHelper from "../../helper/notificationHelper";
import prisma from "../../utils/prisma";
import HttpException from "../../utils/http-error";
import { HttpStatus } from "../../utils/http-status";

// Mock the entire prisma client
jest.mock("../../utils/prisma", () => ({
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback()),
}));

describe("Notification Helper", () => {
  const mockNotification: Partial<Notification> = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    title: "Test Notification",
    message: "This is a test notification",
    type: "BOOKING",
    isRead: false,
  };

  const mockUser = {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe("createNotification", () => {
    it("should create a notification successfully", async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue({
        ...mockNotification,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notificationHelper.createNotification(
        mockNotification as any,
      );
      expect(result).toHaveProperty("id", mockNotification.id);
      expect(result).toHaveProperty("title", mockNotification.title);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: mockNotification,
        include: { user: true },
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        notificationHelper.createNotification(mockNotification as any),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found"),
      );
    });
  });

  describe("getNotifications", () => {
    it("should get notifications for a user", async () => {
      const mockNotifications = [mockNotification];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(
        mockNotifications,
      );

      const result = await notificationHelper.getNotifications(
        "123e4567-e89b-12d3-a456-426614174001",
      );
      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: "123e4567-e89b-12d3-a456-426614174001" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getNotificationById", () => {
    it("should get notification by id", async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const result = await notificationHelper.getNotificationById(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      expect(result).toEqual(mockNotification);
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174000" },
        include: { user: true },
      });
    });

    it("should throw error if notification not found", async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        notificationHelper.getNotificationById(
          "123e4567-e89b-12d3-a456-426614174000",
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Notification not found"),
      );
    });
  });

  describe("updateNotification", () => {
    it("should update a notification successfully", async () => {
      const updateData: Partial<Notification> = {
        title: "Updated Title",
        message: "Updated notification message",
        type: "SYSTEM",
      };

      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(
        mockNotification,
      );
      (prisma.notification.update as jest.Mock).mockResolvedValue({
        ...mockNotification,
        ...updateData,
      });

      const result = await notificationHelper.updateNotification(
        "123e4567-e89b-12d3-a456-426614174000",
        updateData,
      );
      expect(result).toHaveProperty("title", updateData.title);
      expect(result).toHaveProperty("message", updateData.message);
      expect(result).toHaveProperty("type", updateData.type);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174000" },
        data: updateData,
        include: { user: true },
      });
    });

    it("should throw error if notification not found", async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        notificationHelper.updateNotification(
          "123e4567-e89b-12d3-a456-426614174000",
          { title: "Updated Title" },
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Notification not found"),
      );
    });
  });

  describe("deleteNotification", () => {
    it("should delete notification successfully", async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(
        mockNotification,
      );
      (prisma.notification.delete as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      await notificationHelper.deleteNotification(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: "123e4567-e89b-12d3-a456-426614174000" },
      });
    });

    it("should throw error if notification not found", async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        notificationHelper.deleteNotification(
          "123e4567-e89b-12d3-a456-426614174000",
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Notification not found"),
      );
    });
  });
});
