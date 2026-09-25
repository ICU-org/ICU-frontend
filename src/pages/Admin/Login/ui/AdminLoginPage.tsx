import { useAdminSession } from "@/entities/AdminSession";
import { LoginForm } from "@/features/AdminAuth";
import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";

export const AdminLoginPage = () => {
  const t = useT();
  const expired = useAdminSession((s) => s.expired);
  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title={t("admin.loginTitle")} />
      {expired && (
        <p role="status" className="mb-4 rounded border border-line bg-accent-soft p-3 text-sm">
          {t("admin.sessionExpired")}
        </p>
      )}
      <LoginForm />
    </div>
  );
};
