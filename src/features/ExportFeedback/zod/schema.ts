import { z } from "zod";
import { todayInZone } from "@/shared/lib";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const ExportSchema = z
  .object({
    from: z.string().regex(DAY, "validation.required"),
    to: z.string().regex(DAY, "validation.required"),
  })
  // строки YYYY-MM-DD сравниваются как даты
  .refine((v) => v.to >= v.from, { path: ["to"], message: "validation.periodOrder" })
  // в файл попадает только уже случившееся — как проверяет и бэкенд
  .refine((v) => v.to <= todayInZone(), { path: ["to"], message: "validation.periodFuture" });
export type ExportValues = z.infer<typeof ExportSchema>;
