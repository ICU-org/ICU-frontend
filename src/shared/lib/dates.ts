import { config } from "@/shared/config";

/** Сегодня по часовому поясу приложения: «2026-09-25». */
export const todayInZone = () => new Intl.DateTimeFormat("en-CA", { timeZone: config.timeZone }).format(new Date());

/** Дата и время для людей на языке интерфейса, по часовому поясу приложения. */
export const formatDateTime = (value: string | Date, locale?: string | null) =>
  new Intl.DateTimeFormat(locale ?? undefined, {
    timeZone: config.timeZone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

/** Только дата. */
export const formatDate = (value: string | Date, locale?: string | null) =>
  new Intl.DateTimeFormat(locale ?? undefined, { timeZone: config.timeZone, dateStyle: "short" }).format(
    new Date(value)
  );
