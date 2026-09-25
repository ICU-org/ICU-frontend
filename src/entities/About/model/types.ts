import type { Localized } from "@/shared/lib";

/** Для сайта: тексты на языке интерфейса (без перевода — армянский). */
export type About = {
  intro: string;
  stats: Array<{ value: string; label: string }>;
  activities: string[];
  contacts: { address: string | null; hours: string | null; phone: string | null; email: string | null };
};

/** Для админа: все языки. */
export type AboutData = {
  intro: Localized;
  stats: Array<{ value: string; label: Localized }>;
  activities: Localized[];
  contacts: { address: Localized | null; hours: Localized | null; phone: string | null; email: string | null };
};

export type AdminAbout = { data: AboutData; updatedAt: string; updatedBy: string };
