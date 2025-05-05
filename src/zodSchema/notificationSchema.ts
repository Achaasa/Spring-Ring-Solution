import { z } from "zod";

export const notificationSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .uuid({ message: "Invalid user ID format" }),

  title: z
    .string({ required_error: "Title is required" })
    .min(1, { message: "Title cannot be empty" }),

  message: z
    .string({ required_error: "Message is required" })
    .min(1, { message: "Message cannot be empty" }),

  type: z
    .string({ required_error: "Type is required" })
    .min(1, { message: "Type cannot be empty" }),

  isRead: z.boolean().default(false),
});

export const updateNotificationSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID format" }).optional(),

  title: z.string().min(1, { message: "Title cannot be empty" }).optional(),

  message: z.string().min(1, { message: "Message cannot be empty" }).optional(),

  type: z.string().min(1, { message: "Type cannot be empty" }).optional(),

  isRead: z.boolean().optional(),
});

export type NotificationRequestDto = z.infer<typeof notificationSchema>;
export type UpdateNotificationRequestDto = z.infer<
  typeof updateNotificationSchema
>;
