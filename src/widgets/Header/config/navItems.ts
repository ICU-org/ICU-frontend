import type { TranslationKey } from "@/shared/i18n";

/** Ключ перевода, а не текст: список создаётся при загрузке модуля. На главную ведёт логотип. */
export const NAV_ITEMS: ReadonlyArray<{ to: string; label: TranslationKey }> = [
  { to: "/transport", label: "nav.transport" },
  { to: "/about", label: "nav.about" },
  { to: "/partners", label: "nav.partners" },
];
