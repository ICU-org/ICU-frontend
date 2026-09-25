import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";

export const HomePage = () => {
  const t = useT();
  return <PageHeader title={t("common.brand")} lead={t("pages.homeLead")} />;
};
