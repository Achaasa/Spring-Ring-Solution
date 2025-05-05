import { Request, Response } from "express";
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
} from "../helper/bookingHelper";
import { createBookingNotification } from "../services/notificationService";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";

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
    const bookings = await getBookings();
    res.status(HttpStatus.OK).json(bookings);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getBookingByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id);
    res.status(HttpStatus.OK).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const updateBookingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await updateBooking(id, req.body);
    res.status(HttpStatus.OK).json(booking);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const deleteBookingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteBooking(id);
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const approveBookingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;
    const booking = await approveBooking(id, adminId);
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
    const { id } = req.params;
    const { adminId } = req.body;
    const booking = await rejectBooking(id, adminId);
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
