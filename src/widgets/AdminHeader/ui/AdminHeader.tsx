import { Link, NavLink } from "react-router-dom";
import { useAdminSession } from "@/entities/AdminSession";
import { LogoutButton } from "@/features/AdminAuth";
import { LanguageSelect } from "@/features/Language";
import { ThemeToggle } from "@/features/Theme";
import { useT } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { ADMIN_NAV } from "../config/adminNav";

export const AdminHeader = () => {
  const t = useT();
  const admin = useAdminSession((s) => s.admin);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link to="/admin" className="inline-flex min-h-11 items-center font-semibold">
          {t("admin.title")}
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          {admin && <span className="px-2 text-sm text-muted">{admin.login}</span>}
          <LanguageSelect />
          <ThemeToggle />
          {admin && <LogoutButton />}
        </div>
        {admin && (
          <nav aria-label={t("admin.title")} className="w-full">
            <ul className="flex flex-wrap gap-1">
              {ADMIN_NAV.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/admin"}
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
        )}
      </div>
    </header>
  );
};
