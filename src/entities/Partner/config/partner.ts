import type { TranslationKey } from "@/shared/i18n";

/** Как в enum бэкенда (schema.prisma). */
export const PARTNER_TYPES = ["GOV", "CARRIER", "PRIVATE"] as const;
export const PARTNER_SERVICES = ["GPS", "CAMERAS", "ANALYTICS", "MAINTENANCE"] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];
export type PartnerService = (typeof PARTNER_SERVICES)[number];

/** Ключи переводов — названия типов и тегов живут в словаре бэкенда. */
export const TYPE_LABEL: Record<PartnerType, TranslationKey> = {
  GOV: "partners.typeGOV",
  CARRIER: "partners.typeCARRIER",
  PRIVATE: "partners.typePRIVATE",
};
export const SERVICE_LABEL: Record<PartnerService, TranslationKey> = {
  GPS: "partners.serviceGPS",
  CAMERAS: "partners.serviceCAMERAS",
  ANALYTICS: "partners.serviceANALYTICS",
  MAINTENANCE: "partners.serviceMAINTENANCE",
};
