import { z } from "zod";
import { getDefaultLocale } from "@/shared/i18n";

/** Текст содержимого на языках сайта: { hy, ru?, en? } — обязательный язык задаёт бэкенд. */
export type Localized = Record<string, string>;

/** Для формы: у каждого языка есть поле, пусть и пустое. */
export const toLocalizedForm = (value: Localized | null | undefined, locales: string[]): Localized =>
  Object.fromEntries(locales.map((code) => [code, value?.[code] ?? ""]));

/**
 * Схема поля на языках сайта — те же правила, что у бэкенда (content.localized.ts):
 * обязательный язык не пустой; у необязательного поля — либо пусто всё, либо
 * заполнен и обязательный язык. Ошибка — ключ перевода.
 */
export const localizedSchema = (max: number, required: boolean) =>
  z.record(z.string(), z.string()).superRefine((value, ctx) => {
    const texts = Object.values(value).map((text) => text.trim());
    if (texts.some((text) => text.length > max)) ctx.addIssue({ code: "custom", message: "validation.tooLong" });
    const anyFilled = texts.some(Boolean);
    if ((required || anyFilled) && !value[getDefaultLocale()]?.trim()) {
      ctx.addIssue({ code: "custom", message: "validation.required" });
    }
  });
