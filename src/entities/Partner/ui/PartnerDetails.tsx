import type { Ref } from "react";
import { useT } from "@/shared/i18n";
import { SERVICE_LABEL, TYPE_LABEL } from "../config/partner";
import type { Partner } from "../model/types";
import { PartnerLogo } from "./PartnerLogo";

/** Партнёр целиком. titleRef — чтобы при открытии перевести фокус на название. */
export const PartnerDetails = ({ partner, titleRef }: { partner: Partner; titleRef?: Ref<HTMLHeadingElement> }) => {
  const t = useT();
  const meta = [
    partner.vehicleCount !== null && t("partners.vehicles", { count: partner.vehicleCount }),
    partner.partnerSince !== null && t("partners.since", { year: partner.partnerSince }),
  ].filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <PartnerLogo name={partner.name} logoUrl={partner.logoUrl} className="size-28 text-3xl sm:size-32" />
        <div className="min-w-0">
          <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-semibold leading-tight focus:outline-none sm:text-4xl">
            {partner.name}
          </h1>
          <p className="mt-1 text-lg text-muted">{t(TYPE_LABEL[partner.type])}</p>
        </div>
      </header>

      {partner.services.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {partner.services.map((service) => (
            <li key={service} className="rounded bg-accent-soft px-3 py-1">
              {t(SERVICE_LABEL[service])}
            </li>
          ))}
        </ul>
      )}

      {partner.description && <p className="whitespace-pre-line text-lg leading-relaxed">{partner.description}</p>}

      {meta.length > 0 && <p className="text-muted">{meta.join(" · ")}</p>}
    </article>
  );
};
