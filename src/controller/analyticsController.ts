import { Request, Response } from "express";
import {
  getBookingAnalytics,
  getPaymentAnalytics,
  getUserAnalytics,
  getServiceAnalytics,
  getFeedbackAnalytics,
} from "../helper/analyticsHelper";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";

export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const stats = await getBookingAnalytics();
    res.status(HttpStatus.OK).json(stats);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const stats = await getPaymentAnalytics();
    res.status(HttpStatus.OK).json(stats);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await getUserAnalytics();
    res.status(HttpStatus.OK).json(stats);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getServiceStats = async (req: Request, res: Response) => {
  try {
    const stats = await getServiceAnalytics();
    res.status(HttpStatus.OK).json(stats);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    const stats = await getFeedbackAnalytics();
    res.status(HttpStatus.OK).json(stats);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
