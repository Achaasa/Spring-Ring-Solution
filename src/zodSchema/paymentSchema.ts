import { z } from "zod";

export const paymentStatusEnum = z.enum([
  "SUCCESS",
  "FAILED",
  "PENDING",
  "REFUNDED",
]);

export const paymentSchema = z.object({
  bookingId: z
    .string({ required_error: "Booking ID is required" })
    .uuid({ message: "Invalid booking ID format" }),

  amount: z
    .number({ required_error: "Amount is required" })
    .positive({ message: "Amount must be positive" }),

  status: paymentStatusEnum.default("PENDING"),
});

export const updatePaymentSchema = z.object({
  bookingId: z
    .string()
    .uuid({ message: "Invalid booking ID format" })
    .optional(),

  amount: z
    .number()
    .positive({ message: "Amount must be positive" })
    .optional(),

  status: paymentStatusEnum.optional(),
});

export type PaymentRequestDto = z.infer<typeof paymentSchema>;
export type UpdatePaymentRequestDto = z.infer<typeof updatePaymentSchema>;
