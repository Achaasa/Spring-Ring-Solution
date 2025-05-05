import { Request, Response } from "express";
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "../helper/feedbackHelper";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";

export const createFeedbackHandler = async (req: Request, res: Response) => {
  try {
    const feedback = await createFeedback(req.body);
    res.status(HttpStatus.CREATED).json(feedback);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getFeedbacksHandler = async (req: Request, res: Response) => {
  try {
    const feedbacks = await getFeedbacks();
    res.status(HttpStatus.OK).json(feedbacks);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getFeedbackByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await getFeedbackById(id);
    res.status(HttpStatus.OK).json(feedback);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const updateFeedbackHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await updateFeedback(id, req.body);
    res.status(HttpStatus.OK).json(feedback);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const deleteFeedbackHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteFeedback(id);
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
