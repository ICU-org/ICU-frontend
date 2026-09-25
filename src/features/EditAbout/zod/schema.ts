import { z } from "zod";
import { localizedSchema } from "@/shared/lib";

const PHONE = /^[+\d\s()-]{3,30}$/;

/** Те же границы, что у бэкенда (content.validation.ts). */
export const AboutSchema = z.object({
  intro: localizedSchema(1000, true),
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1, "validation.required").max(20, "validation.tooLong"),
        label: localizedSchema(80, true),
      })
    )
    .max(6),
  activities: z.array(z.object({ text: localizedSchema(200, true) })).max(20),
  contacts: z.object({
    address: localizedSchema(200, false),
    hours: localizedSchema(100, false),
    phone: z
      .string()
      .trim()
      .refine((v) => !v || PHONE.test(v), "validation.invalidPhone"),
    email: z
      .string()
      .trim()
      .max(120, "validation.tooLong")
      .refine((v) => !v || z.email().safeParse(v).success, "validation.invalidEmail"),
  }),
});
export type AboutValues = z.infer<typeof AboutSchema>;
