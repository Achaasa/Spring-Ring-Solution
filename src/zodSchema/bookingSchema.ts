import { z } from "zod";

export const bookingStatusEnum = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);

export const bookingSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .uuid({ message: "Invalid user ID format" }),

  serviceId: z
    .string({ required_error: "Service ID is required" })
    .uuid({ message: "Invalid service ID format" }),

  adminId: z.string().uuid({ message: "Invalid admin ID format" }).optional(),

  status: bookingStatusEnum.default("PENDING"),
});

export const updateBookingSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID format" }).optional(),

  serviceId: z
    .string()
    .uuid({ message: "Invalid service ID format" })
    .optional(),

  adminId: z.string().uuid({ message: "Invalid admin ID format" }).optional(),

  status: bookingStatusEnum.optional(),
});

export type BookingRequestDto = z.infer<typeof bookingSchema>;
export type UpdateBookingRequestDto = z.infer<typeof updateBookingSchema>;
