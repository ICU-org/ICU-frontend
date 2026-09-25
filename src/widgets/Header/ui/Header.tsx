import { Link, NavLink } from "react-router-dom";
import { LanguageSelect } from "@/features/Language";
import { ThemeToggle } from "@/features/Theme";
import { useT } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { NAV_ITEMS } from "../config/navItems";

export const Header = () => {
  const t = useT();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link to="/" className="flex min-h-11 items-center gap-2 font-semibold">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-on-accent">
            ◎
          </span>
          {t("common.brand")}
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSelect />
          <ThemeToggle />
        </div>
        <nav aria-label={t("common.menu")} className="w-full">
          <ul className="flex flex-wrap gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    cn(
                        // mobile first: высота 44 px — цель для пальца
                        "flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-accent-soft hover:text-text",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                      isActive && "bg-accent-soft font-medium text-text"
                    )
                  }
                >
                  {t(label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
