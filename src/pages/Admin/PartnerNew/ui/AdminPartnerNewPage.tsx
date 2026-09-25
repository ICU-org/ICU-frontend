import { Link, useNavigate } from "react-router-dom";
import { partnerDisplayName } from "@/entities/Partner";
import { PartnerForm } from "@/features/EditPartner";
import { useLocale, useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";

const LIST_PATH = "/admin/partners";

/** Создание партнёра — отдельный адрес; после сохранения — к списку с «Сохранено». */
export const AdminPartnerNewPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const { locale, defaultLocale } = useLocale();

  return (
    <div className="space-y-4">
      <Link
        to={LIST_PATH}
        className="inline-flex min-h-11 items-center text-sm text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        ← {t("admin.backToPartners")}
      </Link>
      <PageHeader title={t("admin.newPartner")} lead={t("admin.logoAfterSave")} />
      <PartnerForm
        onSaved={(saved) => navigate(LIST_PATH, { state: { savedName: partnerDisplayName(saved, locale, defaultLocale) } })}
        onCancel={() => navigate(LIST_PATH)}
      />
    </div>
  );
};
