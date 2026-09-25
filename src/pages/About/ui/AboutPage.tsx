import { useT } from "@/shared/i18n";
import { PageHeader } from "@/shared/ui";
import { AboutContent } from "@/widgets/AboutContent";

export const AboutPage = () => {
  const t = useT();
  return (
    <>
      <PageHeader title={t("nav.about")} />
      <AboutContent />
    </>
  );
};
