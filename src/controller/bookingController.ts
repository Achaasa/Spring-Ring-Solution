import { NextFunction, Request, Response } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  approveBooking,
  rejectBooking,
  getPendingBookings,
  getApprovedBookings,
  getRejectedBookings,
  getBookingsByUserId,
  addPriceToBooking,
} from "../helper/bookingHelper";
import { createBookingNotification } from "../services/notificationService";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";
import HttpException from "../utils/http-error";

export const createBookingHandler = async (req: Request, res: Response) => {
  try {
    const booking = await createBooking(req.body);
    // Create notification for the user
    await createBookingNotification(booking.userId, booking.id, "CREATED");
    res.status(HttpStatus.CREATED).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getBookingsHandler = async (req: Request, res: Response) => {
  try {
    console.log("getBookingsHandler");
    console.log(req.user.id);
    const bookings = await getBookings();
    res.status(HttpStatus.OK).json(bookings);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getBookingByIdHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingById(bookingId);
    res.status(HttpStatus.OK).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const updateBookingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await updateBooking(bookingId, req.body);
    res.status(HttpStatus.OK).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const deleteBookingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    await deleteBooking(bookingId);
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const approveBookingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { id } = req.user; // taking the id from the request user object
    const booking = await approveBooking(bookingId, id);
    // Create notification for the user
    await createBookingNotification(booking.userId, booking.id, "APPROVED");
    res.status(HttpStatus.OK).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const rejectBookingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { adminId } = req.body;
    const booking = await rejectBooking(bookingId, adminId);
    // Create notification for the user
    await createBookingNotification(booking.userId, booking.id, "REJECTED");
    res.status(HttpStatus.OK).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getPendingBookingsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const bookings = await getPendingBookings();
    res.status(HttpStatus.OK).json(bookings);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getApprovedBookingsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const bookings = await getApprovedBookings();
    res.status(HttpStatus.OK).json(bookings);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getRejectedBookingsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const bookings = await getRejectedBookings();
    res.status(HttpStatus.OK).json(bookings);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getBookingByUserIdHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user.id; 
    const bookings = await getBookingsByUserId(userId);
    res.status(HttpStatus.OK).json(bookings);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const addPriceToBookingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;
    const { price } = req.body;

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid price");
    }

    // Update booking with price
    const updatedBooking = await addPriceToBooking(bookingId,  price );

    res.status(HttpStatus.OK).json(updatedBooking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
