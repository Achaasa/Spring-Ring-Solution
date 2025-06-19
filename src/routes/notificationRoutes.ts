import { Router } from "express";
import {
  createNotificationHandler,
  getNotificationsHandler,
  getNotificationByIdHandler,
  markNotificationAsReadHandler,
  deleteNotificationHandler,
} from "../controller/notificationController";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";
import { validatePayload } from "../middleware/validate-payload";

const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(authenticateJWT);

// Get all notifications for user
notificationRouter.get("/get/:userId", getNotificationsHandler);

// Get a specific notification
notificationRouter.get("/get/:id", getNotificationByIdHandler);

// Mark a notification as read
notificationRouter.put("/read/:id", markNotificationAsReadHandler);

// Delete a notification
notificationRouter.delete("/:id", deleteNotificationHandler);

export default notificationRouter;
