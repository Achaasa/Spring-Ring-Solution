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
  addPriceToBookingHandler,
} from "../controller/bookingController";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";

const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authenticateJWT);

// Create a new booking
bookingRouter.post("/add", createBookingHandler);

// Get all bookings

bookingRouter.get(
  "/get",
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  getBookingsHandler,
);

// Get booking by ID

bookingRouter.get(
  "/get/:bookingId",
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  getBookingByIdHandler,
);

// Update booking

bookingRouter.put(
  "/update/:bookingId",
  authorizeRole(["ADMIN", "SUPER_ADMIN", "USER"]),
  updateBookingHandler,
);
// Add price to booking
bookingRouter.put(
  "/add-price/:bookingId/",
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  addPriceToBookingHandler,
);
// Delete booking

bookingRouter.put(
  "/delete/:bookingId",
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  deleteBookingHandler,
);

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
