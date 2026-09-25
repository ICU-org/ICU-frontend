import { LoginForm } from "@/features/AdminAuth";
import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";

export const AdminLoginPage = () => {
  const t = useT();
  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title={t("admin.loginTitle")} />
      <LoginForm />
    </div>
  );
};
