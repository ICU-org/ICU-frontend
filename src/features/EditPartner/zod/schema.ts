import { z } from "zod";
import { PARTNER_SERVICES, PARTNER_TYPES } from "@/entities/Partner";
import { localizedSchema } from "@/shared/lib";

/** Целое из поля ввода: пусто → null, не число → NaN (см. toIntOrNull в форме). */
const int = () => z.number({ error: "validation.invalidNumber" }).int("validation.invalidNumber");
const YEAR_MAX = new Date().getFullYear() + 1;

/** Те же границы, что у бэкенда (content.validation.ts). */
export const PartnerSchema = z.object({
  name: localizedSchema(120, true),
  description: localizedSchema(600, false),
  type: z.enum(PARTNER_TYPES),
  services: z.array(z.enum(PARTNER_SERVICES)),
  vehicleCount: int().min(0, "validation.notNegative").max(1_000_000, "validation.numberTooLarge").nullable(),
  partnerSince: int().min(1990, "validation.yearRange").max(YEAR_MAX, "validation.yearRange").nullable(),
  sortOrder: int().min(-10_000, "validation.numberTooLarge").max(10_000, "validation.numberTooLarge"),
  isVisible: z.boolean(),
});
export type PartnerValues = z.infer<typeof PartnerSchema>;
