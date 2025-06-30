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
  getBookingByUserIdHandler,
} from "../controller/bookingController";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";

const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authenticateJWT);

// Create a new booking
bookingRouter.post("/add", createBookingHandler);

// Get all bookings
authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  bookingRouter.get("/get", getBookingsHandler);

// Get booking by ID
authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  bookingRouter.get("/get/:bookingId", getBookingByIdHandler);

// Update booking
authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  bookingRouter.put("/update/:bookingId", updateBookingHandler);

// Delete booking
authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  bookingRouter.put("/delete/:bookingId", deleteBookingHandler);

// Admin routes for booking management
bookingRouter.post(
  "/update/:bookingId/approve",
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  approveBookingHandler,
);
bookingRouter.post(
  "/update/:bookingId/reject",
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  rejectBookingHandler,
);

// Get bookings by status
bookingRouter.get("/status/pending", getPendingBookingsHandler);
bookingRouter.get("/status/approved", getApprovedBookingsHandler);
bookingRouter.get("/status/rejected", getRejectedBookingsHandler);
// get bookings by user
bookingRouter.get(
  "/get/user/",
  authorizeRole(["USER", "ADMIN", "SUPER_ADMIN"]),
  getBookingByUserIdHandler,
);
export default bookingRouter;
