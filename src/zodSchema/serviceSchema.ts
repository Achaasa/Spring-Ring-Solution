import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string({ required_error: "Service name is required" })
    .trim()
    .min(1, { message: "Service name can't be empty" }),

  description: z.string().optional(),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Service name can't be empty" })
    .optional(),

  description: z.string().optional(),
});

export type ServiceRequestDto = z.infer<typeof serviceSchema>;
export type UpdateServiceRequestDto = z.infer<typeof updateServiceSchema>;
