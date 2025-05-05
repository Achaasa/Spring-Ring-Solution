import {Router} from "express";
import {
  initializePaymentHandler,
  confirmPaymentHandler,
  getPaymentByIdHandler,
  getPaymentsHandler,
  deletePaymentHandler,
} from "../controller/paymentController";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";

const paymentRouter = Router();
// Confirm payment with reference
paymentRouter.post("/confirm", confirmPaymentHandler);
// All payment routes require authentication
paymentRouter.use(authenticateJWT);

// Initialize payment for a booking
paymentRouter.post("/initialize", initializePaymentHandler);

// Get all payments
paymentRouter.get("/get", authorizeRole(["ADMIN"]), getPaymentsHandler);

// Get payment by ID
paymentRouter.get("/:paymentId", getPaymentByIdHandler);

// Delete payment
paymentRouter.delete("/:id", authorizeRole(["ADMIN"]), deletePaymentHandler);

export default paymentRouter;
