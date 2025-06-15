import prisma from "../../utils/prisma";
import {
  getBookingAnalytics,
  getPaymentAnalytics,
  getUserAnalytics,
  getServiceAnalytics,
  getFeedbackAnalytics,
} from "../../helper/analyticsHelper";
import { formatPrismaError } from "../../utils/formatPrisma";

// Mock prisma client
jest.mock("../../utils/prisma", () => ({
  __esModule: true,
  default: {
    booking: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    service: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    feedback: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

describe("Analytics Helper Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getBookingAnalytics", () => {
    it("should return booking analytics successfully", async () => {
      // Mock the prisma responses
      const mockBookingCount = 100;
      const mockPendingCount = 30;
      const mockAcceptedCount = 50;
      const mockRejectedCount = 20;
      const mockBookingsByService = [
        { serviceId: "1", _count: 20 },
        { serviceId: "2", _count: 30 },
      ];
      const mockBookingsByMonth = [{ createdAt: new Date(), _count: 10 }];

      (prisma.booking.count as jest.Mock).mockImplementation((params) => {
        if (!params) return mockBookingCount;
        if (params.where.status === "PENDING") return mockPendingCount;
        if (params.where.status === "ACCEPTED") return mockAcceptedCount;
        if (params.where.status === "REJECTED") return mockRejectedCount;
        return 0;
      });

      (prisma.booking.groupBy as jest.Mock).mockImplementation((params) => {
        if (params.by.includes("serviceId")) return mockBookingsByService;
        if (params.by.includes("createdAt")) return mockBookingsByMonth;
        return [];
      });

      const result = await getBookingAnalytics();

      expect(result).toEqual({
        totalBookings: mockBookingCount,
        pendingBookings: mockPendingCount,
        acceptedBookings: mockAcceptedCount,
        rejectedBookings: mockRejectedCount,
        bookingsByService: mockBookingsByService,
        bookingsByMonth: mockBookingsByMonth,
      });
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Database error");
      (prisma.booking.count as jest.Mock).mockRejectedValue(mockError);

      await expect(getBookingAnalytics()).rejects.toThrow();
    });
  });

  describe("getPaymentAnalytics", () => {
    it("should return payment analytics successfully", async () => {
      const mockTotalPayments = 100;
      const mockTotalRevenue = { _sum: { amount: 5000 } };
      const mockSuccessfulPayments = 80;
      const mockFailedPayments = 10;
      const mockPendingPayments = 10;
      const mockPaymentsByMonth = [
        { paidAt: new Date(), _sum: { amount: 1000 } },
      ];

      (prisma.payment.count as jest.Mock).mockImplementation((params) => {
        if (!params) return mockTotalPayments;
        if (params.where.status === "SUCCESS") return mockSuccessfulPayments;
        if (params.where.status === "FAILED") return mockFailedPayments;
        if (params.where.status === "PENDING") return mockPendingPayments;
        return 0;
      });

      (prisma.payment.aggregate as jest.Mock).mockResolvedValue(
        mockTotalRevenue,
      );
      (prisma.payment.groupBy as jest.Mock).mockResolvedValue(
        mockPaymentsByMonth,
      );

      const result = await getPaymentAnalytics();

      expect(result).toEqual({
        totalPayments: mockTotalPayments,
        totalRevenue: mockTotalRevenue._sum.amount,
        successfulPayments: mockSuccessfulPayments,
        failedPayments: mockFailedPayments,
        pendingPayments: mockPendingPayments,
        paymentsByMonth: mockPaymentsByMonth,
      });
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Database error");
      (prisma.payment.count as jest.Mock).mockRejectedValue(mockError);

      await expect(getPaymentAnalytics()).rejects.toThrow();
    });
  });

  describe("getUserAnalytics", () => {
    it("should return user analytics successfully", async () => {
      const mockTotalUsers = 100;
      const mockActiveUsers = 80;
      const mockBannedUsers = 10;
      const mockDeletedUsers = 10;
      const mockUsersByRole = [
        { role: "USER", _count: 90 },
        { role: "ADMIN", _count: 10 },
      ];
      const mockNewUsersByMonth = [{ createdAt: new Date(), _count: 20 }];

      (prisma.user.count as jest.Mock).mockImplementation((params) => {
        if (!params) return mockTotalUsers;
        if (params.where.status === "ACTIVE") return mockActiveUsers;
        if (params.where.status === "BANNED") return mockBannedUsers;
        if (params.where.status === "DELETED") return mockDeletedUsers;
        return 0;
      });

      (prisma.user.groupBy as jest.Mock).mockImplementation((params) => {
        if (params.by.includes("role")) return mockUsersByRole;
        if (params.by.includes("createdAt")) return mockNewUsersByMonth;
        return [];
      });

      const result = await getUserAnalytics();

      expect(result).toEqual({
        totalUsers: mockTotalUsers,
        activeUsers: mockActiveUsers,
        bannedUsers: mockBannedUsers,
        deletedUsers: mockDeletedUsers,
        usersByRole: mockUsersByRole,
        newUsersByMonth: mockNewUsersByMonth,
      });
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Database error");
      (prisma.user.count as jest.Mock).mockRejectedValue(mockError);

      await expect(getUserAnalytics()).rejects.toThrow();
    });
  });

  describe("getServiceAnalytics", () => {
    it("should return service analytics successfully", async () => {
      const mockTotalServices = 50;
      const mockPopularServices = [
        { id: "1", name: "Service 1", _count: { bookings: 100 } },
        { id: "2", name: "Service 2", _count: { bookings: 80 } },
      ];

      (prisma.service.count as jest.Mock).mockResolvedValue(mockTotalServices);
      (prisma.service.findMany as jest.Mock).mockResolvedValue(
        mockPopularServices,
      );

      const result = await getServiceAnalytics();

      expect(result).toEqual({
        totalServices: mockTotalServices,
        popularServices: mockPopularServices,
      });
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Database error");
      (prisma.service.count as jest.Mock).mockRejectedValue(mockError);

      await expect(getServiceAnalytics()).rejects.toThrow();
    });
  });

  describe("getFeedbackAnalytics", () => {
    it("should return feedback analytics successfully", async () => {
      const mockTotalFeedbacks = 200;
      const mockAverageRating = { _avg: { rating: 4.5 } };
      const mockFeedbackByRating = [
        { rating: 5, _count: 100 },
        { rating: 4, _count: 70 },
        { rating: 3, _count: 30 },
      ];

      (prisma.feedback.count as jest.Mock).mockResolvedValue(
        mockTotalFeedbacks,
      );
      (prisma.feedback.aggregate as jest.Mock).mockResolvedValue(
        mockAverageRating,
      );
      (prisma.feedback.groupBy as jest.Mock).mockResolvedValue(
        mockFeedbackByRating,
      );

      const result = await getFeedbackAnalytics();

      expect(result).toEqual({
        totalFeedbacks: mockTotalFeedbacks,
        averageRating: mockAverageRating._avg.rating,
        feedbackByRating: mockFeedbackByRating,
      });
    });

    it("should handle errors properly", async () => {
      const mockError = new Error("Database error");
      (prisma.feedback.count as jest.Mock).mockRejectedValue(mockError);

      await expect(getFeedbackAnalytics()).rejects.toThrow();
    });
  });
});
