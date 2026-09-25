import { z } from "zod";

export const LoginSchema = z.object({
  login: z.string().trim().min(1, "validation.required").max(64, "validation.tooLong"),
  password: z.string().min(1, "validation.required").max(256, "validation.tooLong"),
});
export type LoginValues = z.infer<typeof LoginSchema>;
