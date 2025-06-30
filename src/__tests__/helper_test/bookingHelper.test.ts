import { Booking } from "@prisma/client";
import {
  getBookingById,
  updateBooking,
  deleteBooking,
  rejectBooking,
} from "../../helper/bookingHelper";
import * as bookingHelper from "../../helper/bookingHelper";
import prisma from "../../utils/prisma";
import HttpException from "../../utils/http-error";
import { HttpStatus } from "../../utils/http-status";

jest.mock("../../utils/prisma", () => ({
  booking: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  service: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback()),
}));

describe("Booking Helper Tests", () => {
  const mockBooking: Partial<Booking> = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    serviceId: "123e4567-e89b-12d3-a456-426614174002",
    status: "PENDING",
  };

  const mockUser = {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "test@example.com",
  };

  const mockService = {
    id: "123e4567-e89b-12d3-a456-426614174002",
    name: "Test Service",
  };

  const mockAdmin = {
    id: "123e4567-e89b-12d3-a456-426614174003",
    role: "ADMIN",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
  });

  describe("createBooking", () => {
    it("should create a new booking successfully", async () => {
      (prisma.booking.create as jest.Mock).mockResolvedValue({
        ...mockBooking,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await bookingHelper.createBooking(mockBooking as Booking);
      expect(result).toHaveProperty("id", mockBooking.id);
      expect(result).toHaveProperty("status", "PENDING");
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: mockBooking,
        include: {
          user: true,
          service: true,
        },
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.createBooking(mockBooking as Booking)
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found")
      );
    });

    it("should throw error if service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.createBooking(mockBooking as Booking)
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Service not found")
      );
    });
  });

  describe("approveBooking", () => {
    it("should approve booking successfully", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: "ACCEPTED",
        adminId: mockAdmin.id,
      });

      const result = await bookingHelper.approveBooking(
        "123e4567-e89b-12d3-a456-426614174000",
        mockAdmin.id
      );
      expect(result).toHaveProperty("status", "ACCEPTED");
      expect(result).toHaveProperty("adminId", mockAdmin.id);
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.approveBooking(
          "123e4567-e89b-12d3-a456-426614174000",
          mockAdmin.id
        )
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found")
      );
    });

    it("should throw error if admin not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.approveBooking(
          "123e4567-e89b-12d3-a456-426614174000",
          mockAdmin.id
        )
      ).rejects.toThrow(
        new HttpException(HttpStatus.BAD_REQUEST, "Invalid admin")
      );
    });
  });

  // Other test cases for getBookings, getBookingById, etc.

  describe("deleteBooking", () => {
    it("should delete booking successfully", async () => {
      const mockBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        serviceId: "123e4567-e89b-12d3-a456-426614174002",
        status: "PENDING",
        adminId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        price: null,
        delFlag: false,
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue(mockBooking);

      await deleteBooking(mockBooking.id);
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
        data: { delFlag: true },
      });
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteBooking("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found")
      );
    });
  });
});
