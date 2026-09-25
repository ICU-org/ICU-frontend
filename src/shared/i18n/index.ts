export {
  useT,
  useLocale,
  useFieldError,
  useI18nStatus,
  translate,
  hasTranslation,
  getDefaultLocale,
} from "./model/useI18n";
export type { LocaleOption } from "./model/store";
export { loadAdminDictionary } from "./model/instance";
export type { TranslationKey } from "./model/keys.generated";
