const STORAGE_KEY = "locale";

export function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLocale(locale: string) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // язык проживёт до конца сеанса
  }
}

/** Предпочтения по убыванию: выбор в этом браузере → языки браузера. Решает бэкенд. */
export function preferredLocales(): string[] {
  const stored = readStoredLocale();
  const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
  return [...(stored ? [stored] : []), ...browser].filter(Boolean);
}
