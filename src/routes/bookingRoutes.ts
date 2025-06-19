import { Router } from "express";

import {
  createBookingHandler,
  getBookingsHandler,
  getBookingByIdHandler,
  updateBookingHandler,
  deleteBookingHandler,
  approveBookingHandler,
  rejectBookingHandler,
  getPendingBookingsHandler,
  getApprovedBookingsHandler,
  getRejectedBookingsHandler,
} from "../controller/bookingController";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";

const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authenticateJWT);

// Create a new booking
bookingRouter.post("/add", createBookingHandler);

// Get all bookings
bookingRouter.get("/get", getBookingsHandler);

// Get booking by ID
bookingRouter.get("/get/:bookingId", getBookingByIdHandler);

// Update booking
bookingRouter.put("/update/:bookingId", updateBookingHandler);

// Delete booking
bookingRouter.delete("/delete/:bookingId", deleteBookingHandler);

// Admin routes for booking management
bookingRouter.post(
  "/update/:bookingId/approve",
  authorizeRole(["ADMIN"]),
  approveBookingHandler,
);
bookingRouter.post(
  "/update/:bookingId/reject",
  authorizeRole(["ADMIN"]),
  rejectBookingHandler,
);

// Get bookings by status
bookingRouter.get("/status/pending", getPendingBookingsHandler);
bookingRouter.get("/status/approved", getApprovedBookingsHandler);
bookingRouter.get("/status/rejected", getRejectedBookingsHandler);

export default bookingRouter;
