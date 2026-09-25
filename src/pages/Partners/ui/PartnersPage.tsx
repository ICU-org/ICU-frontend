import { useParams } from "react-router-dom";
import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";
import { PartnersCatalog } from "@/widgets/PartnersCatalog";

export const PartnersPage = () => {
  const t = useT();
  const { partnerId } = useParams();
  return (
    <>
      {!partnerId && <PageHeader title={t("nav.partners")} lead={t("pages.partnersLead")} />}
      <PartnersCatalog />
    </>
  );
};
