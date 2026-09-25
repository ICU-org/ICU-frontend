import { z } from "zod";
import { PARTNER_SERVICES, PARTNER_TYPES } from "@/entities/Partner";
import { localizedSchema } from "@/shared/lib";

/** Число из поля ввода: пусто → null (см. setValueAs в форме). */
const optionalInt = (min: number, max: number) =>
  z
    .number({ error: "validation.invalidNumber" })
    .int("validation.invalidNumber")
    .min(min, "validation.invalidNumber")
    .max(max, "validation.invalidNumber")
    .nullable();

/** Те же границы, что у бэкенда (content.validation.ts). */
export const PartnerSchema = z.object({
  name: localizedSchema(120, true),
  description: localizedSchema(600, false),
  type: z.enum(PARTNER_TYPES),
  services: z.array(z.enum(PARTNER_SERVICES)),
  vehicleCount: optionalInt(0, 1_000_000),
  partnerSince: optionalInt(1990, new Date().getFullYear() + 1),
  sortOrder: z
    .number({ error: "validation.invalidNumber" })
    .int("validation.invalidNumber")
    .min(-10_000, "validation.invalidNumber")
    .max(10_000, "validation.invalidNumber"),
  isVisible: z.boolean(),
});
export type PartnerValues = z.infer<typeof PartnerSchema>;
