import { z } from "zod";

/** Те же границы, что у бэкенда (feedback.validation.ts). */
export const MESSAGE_MIN_LENGTH = 3;
export const MESSAGE_MAX_LENGTH = 2000;

export const FeedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN_LENGTH, "validation.tooShort")
    .max(MESSAGE_MAX_LENGTH, "validation.tooLong"),
});
export type FeedbackValues = z.infer<typeof FeedbackSchema>;
