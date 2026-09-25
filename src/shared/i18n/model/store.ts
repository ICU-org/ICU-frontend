import { create } from "zustand";

export type LocaleOption = { code: string; name: string };
export type I18nStatus = "idle" | "loading" | "ready" | "error";

interface I18nState {
  status: I18nStatus;
  locale: string | null;
  /** Язык, обязательный для содержимого сайта (армянский); приходит с бэкенда. */
  defaultLocale: string | null;
  locales: LocaleOption[];
}

export const useI18nStore = create<I18nState>(() => ({
  status: "idle",
  locale: null,
  defaultLocale: null,
  locales: [],
}));
