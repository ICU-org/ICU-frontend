import { Suspense, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminSession } from "@/entities/AdminSession";
import { useT } from "@/shared/i18n";
import { Button, FullScreenSpinner, Spinner } from "@/shared/ui";
import { AdminHeader } from "@/widgets/AdminHeader";

const LOGIN_PATH = "/admin/login";

/**
 * Каркас служебной части. Грузится отдельным куском только при заходе на /admin.
 * Адрес не из списка админов → на главную, как любой несуществующий путь.
 */
const AdminLayout = () => {
  const t = useT();
  const status = useAdminSession((s) => s.status);
  const check = useAdminSession((s) => s.check);
  const { pathname } = useLocation();

  useEffect(() => {
    if (status === "idle") void check();
  }, [status, check]);

  if (status === "idle" || status === "checking") return <FullScreenSpinner />;
  if (status === "denied") return <Navigate to="/" replace />;
  if (status === "error") {
    return (
      <div role="alert" className="grid min-h-full place-items-center gap-3 p-4 text-center">
        <p>{t("errors.INTERNAL")}</p>
        <Button onClick={() => void check()}>{t("common.retry")}</Button>
      </div>
    );
  }

  const onLoginPage = pathname === LOGIN_PATH;
  if (status === "anonymous" && !onLoginPage) return <Navigate to={LOGIN_PATH} replace />;
  if (status === "authenticated" && onLoginPage) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <Suspense
          fallback={
            <div className="py-8 text-center">
              <Spinner />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
