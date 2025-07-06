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

// Get user's own bookings - requires authentication
bookingRouter.get("/get/user/", authenticateJWT, getBookingByUserIdHandler);

// Create a new booking - requires authentication
bookingRouter.post("/add", authenticateJWT, createBookingHandler);

// Get all bookings - requires admin authentication
bookingRouter.get(
  "/get",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN", "USER"]),
  getBookingsHandler,
);

// Get booking by ID - requires admin authentication
bookingRouter.get(
  "/get/:bookingId",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  getBookingByIdHandler,
);

// Update booking - requires authentication
bookingRouter.put(
  "/update/:bookingId",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN", "USER"]),
  updateBookingHandler,
);

// Add price to booking - requires admin authentication
bookingRouter.put(
  "/add-price/:bookingId/",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  addPriceToBookingHandler,
);

// Delete booking - requires admin authentication
bookingRouter.put(
  "/delete/:bookingId",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  deleteBookingHandler,
);

// Admin routes for booking management
bookingRouter.post(
  "/update/:bookingId/approve",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  approveBookingHandler,
);

bookingRouter.post(
  "/update/:bookingId/reject",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  rejectBookingHandler,
);

// Get bookings by status - requires admin authentication
bookingRouter.get(
  "/status/pending",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  getPendingBookingsHandler,
);

bookingRouter.get(
  "/status/approved",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  getApprovedBookingsHandler,
);

bookingRouter.get(
  "/status/rejected",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  getRejectedBookingsHandler,
);

export default bookingRouter;
