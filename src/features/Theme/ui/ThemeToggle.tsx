import { useT } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useThemeStore } from "../model/themeStore";

export const ThemeToggle = () => {
  const t = useT();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <Button variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? t("common.themeLight") : t("common.themeDark")}
    </Button>
  );
};
