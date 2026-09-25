import { useT } from "@/shared/i18n";
import { SERVICE_LABEL, TYPE_LABEL } from "../config/partner";
import type { Partner } from "../model/types";
import { PartnerLogo } from "./PartnerLogo";

export const PartnerCard = ({ partner }: { partner: Partner }) => {
  const t = useT();
  const meta = [
    partner.vehicleCount !== null && t("partners.vehicles", { count: partner.vehicleCount }),
    partner.partnerSince !== null && t("partners.since", { year: partner.partnerSince }),
  ].filter(Boolean);

  return (
    <article className="flex h-full flex-col gap-3 rounded border border-line bg-card p-5">
      <header className="flex items-center gap-3">
        <PartnerLogo name={partner.name} logoUrl={partner.logoUrl} />
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{partner.name}</h3>
          <p className="text-sm text-muted">{t(TYPE_LABEL[partner.type])}</p>
        </div>
      </header>
      {partner.description && <p className="text-sm">{partner.description}</p>}
      {partner.services.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {partner.services.map((service) => (
            <li key={service} className="rounded bg-accent-soft px-2 py-0.5 text-xs">
              {t(SERVICE_LABEL[service])}
            </li>
          ))}
        </ul>
      )}
      {meta.length > 0 && <p className="mt-auto text-xs text-muted">{meta.join(" · ")}</p>}
    </article>
  );
};
