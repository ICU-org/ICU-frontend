import type { AdminPartner } from "../model/types";

/** Название на языке интерфейса; без перевода — на обязательном языке. */
export const partnerDisplayName = (partner: Pick<AdminPartner, "name">, locale: string | null, defaultLocale: string | null) =>
  (locale && partner.name[locale]) || partner.name[defaultLocale ?? "hy"] || "";
