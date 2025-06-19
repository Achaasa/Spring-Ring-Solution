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
          admin: true,
        },
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.createBooking(mockBooking as Booking),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "User not found"),
      );
    });

    it("should throw error if service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.createBooking(mockBooking as Booking),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Service not found"),
      );
    });
  });

  describe("getBookings", () => {
    it("should return all bookings", async () => {
      const mockBookings = [mockBooking];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingHelper.getBookings();
      expect(result).toEqual(mockBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });
  });

  describe("approveBooking", () => {
    it("should approve booking successfully", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: "ACCEPTED",
        adminId: "123e4567-e89b-12d3-a456-426614174003",
      });

      const result = await bookingHelper.approveBooking(
        "123e4567-e89b-12d3-a456-426614174000",
        "123e4567-e89b-12d3-a456-426614174003",
      );
      expect(result).toHaveProperty("status", "ACCEPTED");
      expect(result).toHaveProperty(
        "adminId",
        "123e4567-e89b-12d3-a456-426614174003",
      );
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.approveBooking(
          "123e4567-e89b-12d3-a456-426614174000",
          "123e4567-e89b-12d3-a456-426614174003",
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found"),
      );
    });

    it("should throw error if admin not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingHelper.approveBooking(
          "123e4567-e89b-12d3-a456-426614174000",
          "123e4567-e89b-12d3-a456-426614174003",
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.BAD_REQUEST, "Invalid admin"),
      );
    });
  });

  describe("getPendingBookings", () => {
    it("should return all pending bookings", async () => {
      const mockPendingBookings = [mockBooking];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(
        mockPendingBookings,
      );

      const result = await bookingHelper.getPendingBookings();
      expect(result).toEqual(mockPendingBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: "PENDING",
        },
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });
  });

  describe("getApprovedBookings", () => {
    it("should return all approved bookings", async () => {
      const mockApprovedBookings = [mockBooking];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(
        mockApprovedBookings,
      );

      const result = await bookingHelper.getApprovedBookings();
      expect(result).toEqual(mockApprovedBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: "ACCEPTED",
        },
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });
  });

  describe("getRejectedBookings", () => {
    it("should return all rejected bookings", async () => {
      const mockRejectedBookings = [mockBooking];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(
        mockRejectedBookings,
      );

      const result = await bookingHelper.getRejectedBookings();
      expect(result).toEqual(mockRejectedBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: "REJECTED",
        },
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });
  });

  describe("getBookingById", () => {
    it("should get booking by id", async () => {
      const mockBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        serviceId: "123e4567-e89b-12d3-a456-426614174002",
        status: "PENDING",
        adminId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const result = await getBookingById(mockBooking.id);
      expect(result).toEqual(mockBooking);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        getBookingById("123e4567-e89b-12d3-a456-426614174000"),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found"),
      );
    });
  });

  describe("updateBooking", () => {
    it("should update booking successfully", async () => {
      const mockBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        serviceId: "123e4567-e89b-12d3-a456-426614174002",
        status: "PENDING",
        adminId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        status: "ACCEPTED" as const,
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        ...updateData,
      });

      const result = await updateBooking(mockBooking.id, updateData);
      expect(result).toEqual({ ...mockBooking, ...updateData });
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
        data: updateData,
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        updateBooking("123e4567-e89b-12d3-a456-426614174000", {
          status: "ACCEPTED",
        }),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found"),
      );
    });
  });

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
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.delete as jest.Mock).mockResolvedValue(mockBooking);

      await deleteBooking(mockBooking.id);
      expect(prisma.booking.delete).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
      });
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteBooking("123e4567-e89b-12d3-a456-426614174000"),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found"),
      );
    });
  });

  describe("rejectBooking", () => {
    it("should reject booking successfully", async () => {
      const mockAdmin = {
        id: "123e4567-e89b-12d3-a456-426614174003",
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
      };

      const mockBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        serviceId: "123e4567-e89b-12d3-a456-426614174002",
        status: "PENDING",
        adminId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: "REJECTED",
        adminId: mockAdmin.id,
      });

      const result = await rejectBooking(mockBooking.id, mockAdmin.id);
      expect(result).toEqual({
        ...mockBooking,
        status: "REJECTED",
        adminId: mockAdmin.id,
      });
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
        data: {
          status: "REJECTED",
          adminId: mockAdmin.id,
        },
        include: {
          user: true,
          service: true,
          admin: true,
        },
      });
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        rejectBooking(
          "123e4567-e89b-12d3-a456-426614174000",
          "123e4567-e89b-12d3-a456-426614174003",
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.NOT_FOUND, "Booking not found"),
      );
    });

    it("should throw error if admin not found", async () => {
      const mockBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        serviceId: "123e4567-e89b-12d3-a456-426614174002",
        status: "PENDING",
        adminId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        rejectBooking(
          "123e4567-e89b-12d3-a456-426614174000",
          "123e4567-e89b-12d3-a456-426614174003",
        ),
      ).rejects.toThrow(
        new HttpException(HttpStatus.BAD_REQUEST, "Invalid admin"),
      );
    });
  });
});
