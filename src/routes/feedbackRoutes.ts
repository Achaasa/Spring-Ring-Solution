import { Router } from "express";
import {
  createFeedbackHandler,
  getFeedbacksHandler,
  getFeedbackByIdHandler,
  updateFeedbackHandler,
  deleteFeedbackHandler,
} from "../controller/feedbackController";
import { authenticateJWT } from "../utils/jsonwebtoken";

const feedbackRouter =Router();

// All feedback routes require authentication
feedbackRouter.use(authenticateJWT);

// Create a new feedback
feedbackRouter.post("/add", createFeedbackHandler);

// Get all feedbacks
feedbackRouter.get("/get", getFeedbacksHandler);

// Get feedback by ID
feedbackRouter.get("/get/:id", getFeedbackByIdHandler);

// Update feedback
feedbackRouter.put("/update/:id", updateFeedbackHandler);

// Delete feedback
feedbackRouter.delete("/delete/:id", deleteFeedbackHandler);

export default feedbackRouter;
