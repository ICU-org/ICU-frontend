import { useAdminSession } from "@/entities/AdminSession";
import { useT } from "@/shared/i18n";
import { Button } from "@/shared/ui";

export const LogoutButton = () => {
  const t = useT();
  const signOut = useAdminSession((s) => s.signOut);
  return (
    <Button variant="ghost" onClick={() => void signOut()}>
      {t("admin.signOut")}
    </Button>
  );
};
