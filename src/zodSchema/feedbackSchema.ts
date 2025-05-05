import { z } from "zod";

export const feedbackSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .uuid({ message: "Invalid user ID format" }),

  message: z
    .string({ required_error: "Message is required" })
    .min(1, { message: "Message cannot be empty" }),

  rating: z
    .number({ required_error: "Rating is required" })
    .min(0, { message: "Rating must be at least 0" })
    .max(5, { message: "Rating cannot exceed 5" })
    .int({ message: "Rating must be a whole number" }),
});

export const updateFeedbackSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID format" }).optional(),

  message: z.string().min(1, { message: "Message cannot be empty" }).optional(),

  rating: z
    .number()
    .min(0, { message: "Rating must be at least 0" })
    .max(5, { message: "Rating cannot exceed 5" })
    .int({ message: "Rating must be a whole number" })
    .optional(),
});

export type FeedbackRequestDto = z.infer<typeof feedbackSchema>;
export type UpdateFeedbackRequestDto = z.infer<typeof updateFeedbackSchema>;
