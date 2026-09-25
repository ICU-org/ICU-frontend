import type { Localized } from "@/shared/lib";
import type { PartnerService, PartnerType } from "../config/partner";

/** Для сайта: тексты уже на языке интерфейса (без перевода — армянский). */
export type Partner = {
  id: string;
  name: string;
  description: string | null;
  type: PartnerType;
  services: PartnerService[];
  vehicleCount: number | null;
  partnerSince: number | null;
  logoUrl: string | null;
};

/** Для админа: все языки, скрытые тоже. */
export type AdminPartner = Omit<Partner, "name" | "description"> & {
  name: Localized;
  description: Localized | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerInput = {
  name: Localized;
  description: Localized;
  type: PartnerType;
  services: PartnerService[];
  vehicleCount: number | null;
  partnerSince: number | null;
  sortOrder: number;
  isVisible: boolean;
};
