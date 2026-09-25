import type { FeedbackFilter } from "@/entities/Feedback";
import type { TranslationKey } from "@/shared/i18n";

export const PAGE_SIZE = 50;

/** Ключ перевода, а не текст: список создаётся при загрузке модуля. */
export const FILTERS: ReadonlyArray<{ value: FeedbackFilter; label: TranslationKey }> = [
  { value: "all", label: "admin.filterAll" },
  { value: "included", label: "admin.filterIncluded" },
  { value: "excluded", label: "admin.filterExcluded" },
];
