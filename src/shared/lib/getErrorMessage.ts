import axios from "axios";
import { hasTranslation, translate, type TranslationKey } from "@/shared/i18n";

type ErrorEnvelope = { error?: { code?: string; message?: string; details?: unknown } };

/** `fallback` — ключ перевода: вызывающий не решает, на каком языке говорить. */
export function getErrorMessage(error: unknown, fallback: TranslationKey): string {
  const fallbackText = translate(fallback);
  if (!axios.isAxiosError(error)) return fallbackText;

  const payload = (error.response?.data as ErrorEnvelope | undefined)?.error;
  const code = payload?.code;

  // перевод кода ошибки — в словаре с бэкенда, раздел errors
  if (code && hasTranslation(`errors.${code}`)) {
    return translate(`errors.${code}` as TranslationKey);
  }

  // Незнакомый код: серверный текст лучше заглушки, но только на 4xx —
  // в 5xx может попасть содержимое исключения.
  const status = error.response?.status ?? 0;
  if (payload?.message && status >= 400 && status < 500) return payload.message;

  return fallbackText;
}

/** Код ошибки — когда нужно отличить случай, а не показать текст. */
export function getErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  return (error.response?.data as ErrorEnvelope | undefined)?.error?.code;
}

/** HTTP-статус ответа; undefined — сеть или не ответ сервера. */
export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
