import { Link, NavLink } from "react-router-dom";
import { LanguageSelect } from "@/features/Language";
import { ThemeToggle } from "@/features/Theme";
import { useT } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { NAV_ITEMS } from "../config/navItems";
import { useMobileMenu } from "../model/useMobileMenu";

const MOBILE_MENU_ID = "header-mobile-menu";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    // mobile first: высота 44 px — цель для пальца
    "flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm text-muted hover:bg-accent-soft hover:text-text",
    // рамка фокуса внутрь: nav с overflow обрезал бы её снаружи
    "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
    isActive && "bg-accent-soft font-medium text-text"
  );

export const Header = () => {
  const t = useT();
  const menu = useMobileMenu();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2">
        <Link to="/" onClick={menu.close} className="flex min-h-11 shrink-0 items-center">
          {/* надпись ICU уже на логотипе — текст бренда идёт в alt */}
          <img src="/logo.jpg" alt={t("common.brand")} width={32} height={32} className="size-8 rounded-full" />
        </Link>
        {/* компьютер: вкладки в одной строке с логотипом */}
        <nav aria-label={t("common.menu")} className="hidden min-w-0 flex-1 overflow-x-auto md:block">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to} className="shrink-0">
                <NavLink to={to} className={navLinkClass}>
                  {t(label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <LanguageSelect />
          <ThemeToggle />
          {/* телефон: вкладки — в бургер-меню */}
          <button
            type="button"
            onClick={menu.toggle}
            aria-label={t("common.menu")}
            aria-expanded={menu.open}
            aria-controls={MOBILE_MENU_ID}
            className="grid size-11 place-items-center rounded-md text-muted hover:bg-accent-soft hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:hidden"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              {menu.open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {menu.open && (
        <nav id={MOBILE_MENU_ID} aria-label={t("common.menu")} className="border-t border-line md:hidden">
          <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-2">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} onClick={menu.close} className={navLinkClass}>
                  {t(label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};
