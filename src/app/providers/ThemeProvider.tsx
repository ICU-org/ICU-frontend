import { useEffect } from "react";
import { applyTheme, useThemeStore } from "@/features/Theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => applyTheme(theme), [theme]);
  return <>{children}</>;
};
