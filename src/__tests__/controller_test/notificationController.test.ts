import { Request, Response } from "express";
import {
  MockRequest,
  MockResponse,
  createRequest,
  createResponse,
} from "node-mocks-http";
import {
  createNotificationHandler,
  getNotificationsHandler,
  getNotificationByIdHandler,
  updateNotificationHandler,
  deleteNotificationHandler,
  markNotificationAsReadHandler,
} from "../../controller/notificationController";
import * as notificationHelper from "../../helper/notificationHelper";
import { HttpStatus } from "../../utils/http-status";

jest.mock("../../helper/notificationHelper");

describe("Notification Controller", () => {
  let mockRequest: MockRequest<Request>;
  let mockResponse: MockResponse<Response>;

  beforeEach(() => {
    mockRequest = createRequest();
    mockResponse = createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createNotificationHandler", () => {
    const mockNotificationData = {
      userId: "user1",
      message: "Test notification",
      type: "TEST",
    };

    it("should create a new notification successfully", async () => {
      const mockCreatedNotification = {
        id: "1",
        ...mockNotificationData,
        read: false,
      };
      mockRequest.body = mockNotificationData;
      (notificationHelper.createNotification as jest.Mock).mockResolvedValue(
        mockCreatedNotification,
      );

      await createNotificationHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.CREATED);
      expect(JSON.parse(mockResponse._getData())).toEqual(
        mockCreatedNotification,
      );
    });

    it("should handle errors properly", async () => {
      mockRequest.body = mockNotificationData;
      const error = new Error("Database error");
      (notificationHelper.createNotification as jest.Mock).mockRejectedValue(
        error,
      );

      await createNotificationHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getNotificationsHandler", () => {
    it("should return all notifications for a user", async () => {
      const mockNotifications = [
        { id: "1", userId: "user1", message: "Test 1", read: false },
        { id: "2", userId: "user1", message: "Test 2", read: true },
      ];
      mockRequest.params = { userId: "user1" };
      (notificationHelper.getNotifications as jest.Mock).mockResolvedValue(
        mockNotifications,
      );

      await getNotificationsHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockNotifications);
    });

    it("should handle errors", async () => {
      mockRequest.params = { userId: "user1" };
      const error = new Error("Database error");
      (notificationHelper.getNotifications as jest.Mock).mockRejectedValue(
        error,
      );

      await getNotificationsHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("markNotificationAsReadHandler", () => {
    const mockNotification = {
      id: "1",
      userId: "user1",
      message: "Test notification",
      read: true,
    };

    it("should mark a notification as read", async () => {
      mockRequest.params = { id: "1" };
      (
        notificationHelper.markNotificationAsRead as jest.Mock
      ).mockResolvedValue(mockNotification);

      await markNotificationAsReadHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockNotification);
    });

    it("should handle non-existent notification", async () => {
      mockRequest.params = { id: "999" };
      const error = new Error("Notification not found");
      (
        notificationHelper.markNotificationAsRead as jest.Mock
      ).mockRejectedValue(error);

      await markNotificationAsReadHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("deleteNotificationHandler", () => {
    it("should delete a notification successfully", async () => {
      mockRequest.params = { id: "1" };
      (notificationHelper.deleteNotification as jest.Mock).mockResolvedValue(
        undefined,
      );

      await deleteNotificationHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.NO_CONTENT);
    });

    it("should handle errors during deletion", async () => {
      mockRequest.params = { id: "1" };
      const error = new Error("Deletion failed");
      (notificationHelper.deleteNotification as jest.Mock).mockRejectedValue(
        error,
      );

      await deleteNotificationHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getNotificationByIdHandler", () => {
    it("should get notification by id successfully", async () => {
      const mockNotification = { id: "1" };
      mockRequest.params = { id: "1" };
      (notificationHelper.getNotificationById as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      await getNotificationByIdHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockNotification);
    });

    it("should handle get notification errors", async () => {
      mockRequest.params = { id: "1" };
      const error = new Error("Fetch failed");
      (notificationHelper.getNotificationById as jest.Mock).mockRejectedValue(
        error,
      );

      await getNotificationByIdHandler(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });
});
