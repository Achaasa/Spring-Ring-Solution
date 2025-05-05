import {Router} from "express";
import {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getServiceStats,
  getFeedbackStats,
} from "../controller/analyticsController";
import { authenticateJWT,authorizeRole } from "../utils/jsonwebtoken";

const analyticsRouter = Router();

// All analytics routes require admin access
analyticsRouter.use(authenticateJWT)
analyticsRouter.use(authorizeRole(["ADMIN"]));

// Get booking statistics
analyticsRouter.get("/bookings", getBookingStats);

// Get payment statistics
analyticsRouter.get("/payments", getPaymentStats);

// Get user statistics
analyticsRouter.get("/users", getUserStats);

// Get service statistics
analyticsRouter.get("/services", getServiceStats);

// Get feedback statistics
analyticsRouter.get("/feedback", getFeedbackStats);

export default analyticsRouter;
