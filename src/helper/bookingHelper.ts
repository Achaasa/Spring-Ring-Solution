import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { bookingSchema, updateBookingSchema } from "../zodSchema/bookingSchema";
import { formatPrismaError } from "../utils/formatPrisma";
import { Booking } from "@prisma/client";

export const createBooking = async (bookingData: Booking) => {
  try {
    const validateBooking = bookingSchema.safeParse(bookingData);
    if (!validateBooking.success) {
      const errors = validateBooking.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: bookingData.userId },
    });
    if (!user) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: bookingData.serviceId },
    });
    if (!service) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Service not found");
    }

    const newBooking = await prisma.booking.create({
      data: bookingData,
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    return newBooking;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getBookings = async () => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    return bookings;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getBookingById = async (id: string) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    if (!booking) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Booking not found.");
    }
    return booking;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const updateBooking = async (
  id: string,
  bookingData: Partial<Booking>,
) => {
  try {
    const validateBooking = updateBookingSchema.safeParse(bookingData);
    if (!validateBooking.success) {
      const errors = validateBooking.error.issues.map(
        ({ message, path }) => `${path}: ${message}`,
      );
      throw new HttpException(HttpStatus.BAD_REQUEST, errors.join(". "));
    }

    const findBooking = await prisma.booking.findUnique({ where: { id } });
    if (!findBooking) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Booking not found");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: bookingData,
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    return updatedBooking;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const findBooking = await getBookingById(id);
    if (!findBooking) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Booking does not exist");
    }

    await prisma.booking.delete({ where: { id } });
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const approveBooking = async (id: string, adminId: string) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });

    if (!booking) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Booking not found");
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!admin || admin.role !== "ADMIN") {
      throw new HttpException(HttpStatus.FORBIDDEN, "Invalid admin");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        adminId: adminId,
      },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });

    return updatedBooking;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const rejectBooking = async (id: string, adminId: string) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });

    if (!booking) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Booking not found");
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!admin || admin.role !== "ADMIN") {
      throw new HttpException(HttpStatus.FORBIDDEN, "Invalid admin");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminId: adminId,
      },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });

    return updatedBooking;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getPendingBookings = async () => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    return bookings;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getApprovedBookings = async () => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "ACCEPTED",
      },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    return bookings;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getRejectedBookings = async () => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "REJECTED",
      },
      include: {
        user: true,
        service: true,
        admin: true,
      },
    });
    return bookings;
  } catch (error) {
    throw formatPrismaError(error);
  }
};
