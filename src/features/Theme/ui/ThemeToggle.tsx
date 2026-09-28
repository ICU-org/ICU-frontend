import { useT } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useThemeStore } from "../model/themeStore";

export const ThemeToggle = () => {
  const t = useT();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const label = theme === "dark" ? t("common.themeLight") : t("common.themeDark");

  return (
    <Button
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="size-11 px-0 text-xl"
    >
      {/* ︎ — текстовый вид: без него iOS рисует ☀ цветным эмодзи */}
      <span aria-hidden>{theme === "dark" ? "☀︎" : "☾︎"}</span>
    </Button>
  );
};
