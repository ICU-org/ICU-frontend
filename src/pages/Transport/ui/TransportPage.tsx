import { FeedbackDisclosure } from "@/features/SubmitFeedback";
import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";

export const TransportPage = () => {
  const t = useT();
  return (
    <div className="space-y-10">
      <div>
        <PageHeader title={t("nav.transport")} lead={t("pages.transportLead")} />
        <p className="text-muted">{t("common.comingSoon")}</p>
      </div>
      {/* жалобы и предложения — только здесь, внизу и неброско */}
      <FeedbackDisclosure />
    </div>
  );
};
