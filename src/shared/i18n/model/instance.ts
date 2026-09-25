import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { api } from "@/shared/api";
import { preferredLocales, storeLocale } from "./storage";
import { useI18nStore, type LocaleOption } from "./store";

/*
 * Словари живут на бэкенде. Публичный — GET /api/i18n: бэкенд выбирает язык
 * из списка предпочтений. Служебный — GET /api/admin/i18n, только с адресов
 * админов; грузится, когда открыта админка, и дальше при каждой смене языка.
 */
type DictionaryResponse = {
  locale: string;
  defaultLocale: string;
  locales: LocaleOption[];
  messages: Record<string, Record<string, string>>;
};

void i18n.use(initReactI18next).init({
  resources: {},
  fallbackLng: false, // запасного языка нет: словарь приходит целиком
  interpolation: { escapeValue: false }, // React экранирует сам
  returnNull: false,
});

const fetchDictionary = async (path: string, lang: string) =>
  (await api.get<DictionaryResponse>(path, { params: { lang } })).data;

const addBundle = (data: DictionaryResponse) =>
  i18n.addResourceBundle(data.locale, "translation", data.messages, true, true);

let adminEnabled = false;

async function loadDictionary(preferred: string[]) {
  const dictionary = await fetchDictionary("/i18n", preferred.join(","));
  // служебный словарь — до смены языка, чтобы админка не мелькнула ключами
  const adminDictionary = adminEnabled ? await fetchDictionary("/admin/i18n", dictionary.locale) : null;
  addBundle(dictionary);
  if (adminDictionary) addBundle(adminDictionary);
  await i18n.changeLanguage(dictionary.locale);
  document.documentElement.lang = dictionary.locale;
  useI18nStore.setState({
    status: "ready",
    locale: dictionary.locale,
    defaultLocale: dictionary.defaultLocale,
    locales: dictionary.locales,
  });
  return dictionary.locale;
}

/** Первая загрузка при старте приложения; повторный вызов — «попробовать снова». */
export async function initI18n() {
  if (useI18nStore.getState().status === "loading") return;
  useI18nStore.setState({ status: "loading" });
  try {
    await loadDictionary(preferredLocales());
  } catch {
    useI18nStore.setState({ status: "error" });
  }
}

/** Смена языка. Не загрузилось — остаётся текущий язык, интерфейс не ломается. */
export async function changeLocale(locale: string) {
  try {
    storeLocale(await loadDictionary([locale]));
  } catch {
    // текущий словарь уже загружен — продолжаем на нём
  }
}

/** Тексты админки на текущем языке. Бросает ошибку, если адрес не из списка админов. */
export async function loadAdminDictionary() {
  if (adminEnabled) return;
  addBundle(await fetchDictionary("/admin/i18n", useI18nStore.getState().locale ?? i18n.language));
  adminEnabled = true;
}

export { i18n };
