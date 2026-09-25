import { AboutEditor } from "@/features/EditAbout";
import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";

export const AdminAboutPage = () => {
  const t = useT();
  return (
    <>
      <PageHeader title={t("admin.aboutTitle")} lead={t("admin.partnersHint")} />
      <AboutEditor />
    </>
  );
};
