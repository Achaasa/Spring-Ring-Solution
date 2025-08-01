import { createNotification } from "../helper/notificationHelper";

export const createBookingNotification = async (
  userId: string,
  bookingId: string,
  type: "CREATED" | "APPROVED" | "REJECTED",
) => {
  const messages = {
    CREATED: "Your booking has been created and is pending approval",
    APPROVED: "Your booking has been approved",
    REJECTED: "Your booking has been rejected",
  };

  await createNotification({
    userId,
    title: "Booking Update",
    message: messages[type],
    type: "BOOKING",
    isRead: false,
    createdAt: new Date(), // Will be overwritten by the database
    updatedAt: new Date(), // Will be overwritten by the database
    delFlag: false, // Default value
  });
};

export const createPaymentNotification = async (
  userId: string,
  paymentId: string,
  type: "SUCCESS" | "FAILED" | "REFUNDED",
) => {
  const messages = {
    SUCCESS: "Your payment has been processed successfully",
    FAILED: "Your payment failed. Please try again",
    REFUNDED: "Your payment has been refunded",
  };

  await createNotification({
    userId,
    title: "Payment Update",
    message: messages[type],
    type: "PAYMENT",
    isRead: false,
    createdAt: new Date(), // Will be overwritten by the database
    updatedAt: new Date(), // Will be overwritten by the database
    delFlag: false, // Default value

  });
};

export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  await createNotification({
    userId,
    title,
    message,
    type: "SYSTEM",
    isRead: false,
    createdAt: new Date(), // Will be overwritten by the database
    updatedAt: new Date(), // Will be overwritten by the database
    delFlag: false, // Default value

  });
};
