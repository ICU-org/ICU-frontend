import { useLocale, useT } from "@/shared/i18n";
import { Select } from "@/shared/ui";

/** Список языков приходит с бэкенда вместе со словарём. */
export const LanguageSelect = () => {
  const t = useT();
  const { locale, locales, setLocale } = useLocale();
  if (locales.length < 2) return null;

  return (
    <Select
      aria-label={t("common.language")}
      value={locale ?? ""}
      onChange={(e) => void setLocale(e.target.value)}
      className="px-2"
    >
      {locales.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </Select>
  );
};
