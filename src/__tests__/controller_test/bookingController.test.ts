import { Request, Response } from "express";
import {
  MockRequest,
  MockResponse,
  createRequest,
  createResponse,
} from "node-mocks-http";
import {
  createBookingHandler,
  getBookingsHandler,
  getBookingByIdHandler,
  updateBookingHandler,
  deleteBookingHandler,
  approveBookingHandler,
  rejectBookingHandler,
} from "../../controller/bookingController";
import * as bookingHelper from "../../helper/bookingHelper";
import * as notificationService from "../../services/notificationService";
import { HttpStatus } from "../../utils/http-status";

// Mock the dependencies
jest.mock("../../helper/bookingHelper");
jest.mock("../../services/notificationService");

describe("Booking Controller", () => {
  let mockRequest: MockRequest<Request>;
  let mockResponse: MockResponse<Response>;

  beforeEach(() => {
    mockRequest = createRequest();
    mockResponse = createResponse();
    // Mock notification service to resolve successfully
    (
      notificationService.createBookingNotification as jest.Mock
    ).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBookingHandler", () => {
    const mockBookingData = {
      userId: "user1",
      serviceId: "service1",
      date: "2025-06-01",
      time: "10:00",
      duration: 60,
    };

    it("should create booking successfully", async () => {
      const mockCreatedBooking = {
        id: "1",
        status: "PENDING",
        ...mockBookingData,
      };
      mockRequest.body = mockBookingData;
      (bookingHelper.createBooking as jest.Mock).mockResolvedValue(
        mockCreatedBooking,
      );

      await createBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.CREATED);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockCreatedBooking);
    });

    it("should handle creation errors", async () => {
      mockRequest.body = mockBookingData;
      const error = new Error("Creation failed");
      (bookingHelper.createBooking as jest.Mock).mockRejectedValue(error);

      await createBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("approveBookingHandler", () => {
    it("should approve booking successfully", async () => {
      const mockApprovedBooking = {
        id: "1",
        status: "APPROVED",
        userId: "user1",
        serviceId: "service1",
      };
      mockRequest.params = { id: "1" };
      (bookingHelper.approveBooking as jest.Mock).mockResolvedValue(
        mockApprovedBooking,
      );

      await approveBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockApprovedBooking);
    });

    it("should handle approval errors", async () => {
      mockRequest.params = { id: "1" };
      const error = new Error("Approval failed");
      (bookingHelper.approveBooking as jest.Mock).mockRejectedValue(error);

      await approveBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("rejectBookingHandler", () => {
    it("should reject booking successfully", async () => {
      const mockRejectedBooking = {
        id: "1",
        status: "REJECTED",
        userId: "user1",
        serviceId: "service1",
      };
      mockRequest.params = { id: "1" };
      mockRequest.body = { reason: "Service unavailable" };
      (bookingHelper.rejectBooking as jest.Mock).mockResolvedValue(
        mockRejectedBooking,
      );

      await rejectBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockRejectedBooking);
    });

    it("should handle rejection errors", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { reason: "Service unavailable" };
      const error = new Error("Rejection failed");
      (bookingHelper.rejectBooking as jest.Mock).mockRejectedValue(error);

      await rejectBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getBookingsHandler", () => {
    const mockBookings = [
      { id: "1", status: "PENDING", userId: "user1" },
      { id: "2", status: "APPROVED", userId: "user2" },
    ];

    it("should get bookings successfully", async () => {
      mockRequest.query = { page: "1", limit: "10", status: "ALL" };
      (bookingHelper.getBookings as jest.Mock).mockResolvedValue({
        bookings: mockBookings,
        total: 2,
      });

      await getBookingsHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        bookings: mockBookings,
        total: 2,
      });
    });

    it("should handle errors when getting bookings", async () => {
      mockRequest.query = { page: "1", limit: "10", status: "ALL" };
      const error = new Error("Failed to fetch bookings");
      (bookingHelper.getBookings as jest.Mock).mockRejectedValue(error);

      await getBookingsHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("getBookingByIdHandler", () => {
    const mockBooking = {
      id: "1",
      status: "PENDING",
      userId: "user1",
      serviceId: "service1",
    };

    it("should get booking by id successfully", async () => {
      mockRequest.params = { id: "1" };
      (bookingHelper.getBookingById as jest.Mock).mockResolvedValue(
        mockBooking,
      );

      await getBookingByIdHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockBooking);
    });

    it("should handle non-existent booking", async () => {
      mockRequest.params = { id: "999" };
      const error = new Error("Booking not found");
      (bookingHelper.getBookingById as jest.Mock).mockRejectedValue(error);

      await getBookingByIdHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("updateBookingHandler", () => {
    const mockUpdateData = {
      date: "2025-06-02",
      time: "11:00",
      duration: 90,
    };

    it("should update booking successfully", async () => {
      const mockUpdatedBooking = {
        id: "1",
        status: "PENDING",
        userId: "user1",
        serviceId: "service1",
        ...mockUpdateData,
      };
      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      (bookingHelper.updateBooking as jest.Mock).mockResolvedValue(
        mockUpdatedBooking,
      );

      await updateBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.OK);
      expect(JSON.parse(mockResponse._getData())).toEqual(mockUpdatedBooking);
    });

    it("should handle update errors", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      const error = new Error("Update failed");
      (bookingHelper.updateBooking as jest.Mock).mockRejectedValue(error);

      await updateBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });

  describe("deleteBookingHandler", () => {
    it("should delete booking successfully", async () => {
      mockRequest.params = { id: "1" };
      (bookingHelper.deleteBooking as jest.Mock).mockResolvedValue(undefined);

      await deleteBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(HttpStatus.NO_CONTENT);
    });

    it("should handle deletion errors", async () => {
      mockRequest.params = { id: "1" };
      const error = new Error("Deletion failed");
      (bookingHelper.deleteBooking as jest.Mock).mockRejectedValue(error);

      await deleteBookingHandler(mockRequest, mockResponse);

      expect(mockResponse._getStatusCode()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(JSON.parse(mockResponse._getData())).toHaveProperty("message");
    });
  });
});
