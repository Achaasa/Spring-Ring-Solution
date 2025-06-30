import { Request, Response } from "express";
import {
  initializePayment,
  confirmPayment,
  getPaymentById,
  getPayments,
  deletePayment,
} from "../helper/paymentHelper";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { formatPrismaError } from "../utils/formatPrisma";

export const initializePaymentHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId, amount } = req.body;
    const result = await initializePayment(bookingId);
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const confirmPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;
    const payment = await confirmPayment(reference);
    res.status(HttpStatus.OK).json(payment);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getPaymentByIdHandler = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentById(paymentId);
    res.status(HttpStatus.OK).json(payment);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const getPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const payments = await getPayments();
    res.status(HttpStatus.OK).json(payments);
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};

export const deletePaymentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deletePayment(id);
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    const err = formatPrismaError(error);
    res.status(err.status).json({ message: err.message });
  }
};
