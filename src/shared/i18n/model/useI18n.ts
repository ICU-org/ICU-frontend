import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { changeLocale, i18n, initI18n } from "./instance";
import { useI18nStore } from "./store";
import type { TranslationKey } from "./keys.generated";

type Values = Record<string, string | number>;

/** Перевод вне компонента: язык на момент вызова. */
export const translate = (key: TranslationKey, values?: Values) =>
  i18n.t(key, values ?? {}) as string;

/** Есть ли текст для ключа, пришедшего извне (например, код ошибки сервера). */
export const hasTranslation = (key: string) => i18n.exists(key);

/** Перевод в компоненте. */
export function useT() {
  const { t } = useTranslation();
  return useCallback((key: TranslationKey, values?: Values) => t(key, values ?? {}) as string, [t]);
}

/**
 * Ошибка поля формы: ключ "validation.*" → текст; прочие строки как есть.
 * Принимает и объект ошибки — у полей-словарей (Record) react-hook-form
 * типизирует errors.x.message как FieldError, хотя там строка.
 */
export function useFieldError() {
  const t = useT();
  return useCallback(
    (error?: unknown) => {
      const message =
        typeof error === "string" ? error : (error as { message?: unknown } | undefined)?.message;
      if (typeof message !== "string" || !message) return undefined;
      return message.startsWith("validation.") ? t(message as TranslationKey) : message;
    },
    [t]
  );
}

/** Текущий язык, доступные языки (с бэкенда) и смена. */
export function useLocale() {
  const locale = useI18nStore((s) => s.locale);
  const defaultLocale = useI18nStore((s) => s.defaultLocale);
  const locales = useI18nStore((s) => s.locales);
  return { locale, defaultLocale, locales, setLocale: changeLocale };
}

/** Обязательный язык содержимого — для проверок вне компонента (схемы zod). */
export const getDefaultLocale = () => useI18nStore.getState().defaultLocale ?? "hy";

/** Состояние загрузки словаря — для экрана до первой отрисовки. */
export function useI18nStatus() {
  const status = useI18nStore((s) => s.status);
  return { status, load: initI18n };
}
