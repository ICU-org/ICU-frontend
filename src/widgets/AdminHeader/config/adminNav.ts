import type { TranslationKey } from "@/shared/i18n";

export const ADMIN_NAV: ReadonlyArray<{ to: string; label: TranslationKey }> = [
  { to: "/admin", label: "admin.navFeedback" },
  { to: "/admin/partners", label: "admin.navPartners" },
  { to: "/admin/about", label: "admin.navAbout" },
];
