import prisma from "../utils/prisma";
import HttpException from "../utils/http-error";
import { HttpStatus } from "../utils/http-status";
import { Payment, Booking } from "@prisma/client";
import { ErrorResponse } from "../utils/types";
import paystack from "../utils/paystack";
import { formatPrismaError } from "../utils/formatPrisma";
import { paymentSchema, updatePaymentSchema } from "../zodSchema/paymentSchema";

export const initializePayment = async (bookingId: string) => {
  try {
    // Check if the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!booking) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Booking not found.");
    }
    // check if booking is accepted before allowing payment
    if (booking.status !== "ACCEPTED") {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        `booking is not yet accepted: ${booking.status}`,
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        "Payment already exists for this booking.",
      );
    }
    const amount = booking.price;
    if (!amount || amount <= 0) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid booking price.");
    }
    // Create a Paystack transaction
    const paymentResponse = await paystack.initializeTransaction(
      booking.user.email,
      amount,
      {
        bookingId,
        serviceName: booking.service.name,
      },
    );

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        status: "PENDING",
      },
    });

    return {
      authorizationUrl: paymentResponse.data.authorization_url,
      paymentId: payment.id,
    };
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const confirmPayment = async (reference: string) => {
  try {
    const verificationResponse = await paystack.verifyTransaction(reference);

    if (verificationResponse.data.status !== "success") {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        "Payment verification failed.",
      );
    }

    // Find payment by reference
    const payment = await prisma.payment.findFirst({
      where: {
        booking: {
          id: verificationResponse.data.metadata.bookingId,
        },
      },
    });

    if (!payment) {
      throw new HttpException(
        HttpStatus.NOT_FOUND,
        "Payment record not found.",
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "ACCEPTED",
      },
    });

    return updatedPayment;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getPaymentById = async (paymentId: string) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: true,
            service: true,
          },
        },
      },
    });

    if (!payment) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Payment not found");
    }

    return payment;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const getPayments = async () => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: true,
      },
    });
    return payments;
  } catch (error) {
    throw formatPrismaError(error);
  }
};

export const deletePayment = async (id: string) => {
  try {
    const findPayment = await getPaymentById(id);
    if (!findPayment) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Payment does not exist");
    }

    await prisma.payment.delete({ where: { id } });
  } catch (error) {
    throw formatPrismaError(error);
  }
};
