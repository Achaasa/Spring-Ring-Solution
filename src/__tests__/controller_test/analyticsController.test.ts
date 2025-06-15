import { Request, Response } from "express";
import {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getServiceStats,
  getFeedbackStats,
} from "../../controller/analyticsController";
import * as analyticsHelper from "../../helper/analyticsHelper";
import { HttpStatus } from "../../utils/http-status";

jest.mock("../../helper/analyticsHelper");

describe("Analytics Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe("getBookingStats", () => {
    it("should return booking statistics successfully", async () => {
      const mockStats = {
        totalBookings: 100,
        pendingBookings: 30,
        acceptedBookings: 50,
        rejectedBookings: 20,
        bookingsByService: [{ serviceId: "1", _count: 20 }],
        bookingsByMonth: [{ createdAt: new Date(), _count: 10 }],
      };

      (analyticsHelper.getBookingAnalytics as jest.Mock).mockResolvedValue(
        mockStats,
      );

      await getBookingStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Failed to fetch booking stats");
      (analyticsHelper.getBookingAnalytics as jest.Mock).mockRejectedValue(
        mockError,
      );

      await getBookingStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getPaymentStats", () => {
    it("should return payment statistics successfully", async () => {
      const mockStats = {
        totalPayments: 100,
        totalRevenue: 5000,
        successfulPayments: 80,
        failedPayments: 10,
        pendingPayments: 10,
        paymentsByMonth: [{ paidAt: new Date(), _sum: { amount: 1000 } }],
      };

      (analyticsHelper.getPaymentAnalytics as jest.Mock).mockResolvedValue(
        mockStats,
      );

      await getPaymentStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Failed to fetch payment stats");
      (analyticsHelper.getPaymentAnalytics as jest.Mock).mockRejectedValue(
        mockError,
      );

      await getPaymentStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics successfully", async () => {
      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        bannedUsers: 10,
        deletedUsers: 10,
        usersByRole: [
          { role: "USER", _count: 90 },
          { role: "ADMIN", _count: 10 },
        ],
        newUsersByMonth: [{ createdAt: new Date(), _count: 20 }],
      };

      (analyticsHelper.getUserAnalytics as jest.Mock).mockResolvedValue(
        mockStats,
      );

      await getUserStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Failed to fetch user stats");
      (analyticsHelper.getUserAnalytics as jest.Mock).mockRejectedValue(
        mockError,
      );

      await getUserStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getServiceStats", () => {
    it("should return service statistics successfully", async () => {
      const mockStats = {
        totalServices: 50,
        popularServices: [
          { id: "1", name: "Service 1", _count: { bookings: 100 } },
          { id: "2", name: "Service 2", _count: { bookings: 80 } },
        ],
      };

      (analyticsHelper.getServiceAnalytics as jest.Mock).mockResolvedValue(
        mockStats,
      );

      await getServiceStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Failed to fetch service stats");
      (analyticsHelper.getServiceAnalytics as jest.Mock).mockRejectedValue(
        mockError,
      );

      await getServiceStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe("getFeedbackStats", () => {
    it("should return feedback statistics successfully", async () => {
      const mockStats = {
        totalFeedbacks: 200,
        averageRating: 4.5,
        feedbackByRating: [
          { rating: 5, _count: 100 },
          { rating: 4, _count: 70 },
          { rating: 3, _count: 30 },
        ],
      };

      (analyticsHelper.getFeedbackAnalytics as jest.Mock).mockResolvedValue(
        mockStats,
      );

      await getFeedbackStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Failed to fetch feedback stats");
      (analyticsHelper.getFeedbackAnalytics as jest.Mock).mockRejectedValue(
        mockError,
      );

      await getFeedbackStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });
});
