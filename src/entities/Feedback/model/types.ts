/** Ответ POST /api/feedback. Номера обращения нет — обращения анонимные. */
export type FeedbackReceipt = { id: string; createdAt: string };

// ── служебное ──

/** Обращение в списке админа. excludedAt — исключено из выгрузки (мусор). */
export type FeedbackItem = { id: string; message: string; createdAt: string; excludedAt: string | null };

export type FeedbackFilter = "all" | "included" | "excluded";

export type FeedbackPage = { items: FeedbackItem[]; total: number; page: number; pageSize: number };

/** Запись журнала выгрузок. Границы периода — UTC, periodTo не включается. */
export type ExportBatch = {
  id: string;
  periodFrom: string;
  periodTo: string;
  count: number;
  exportedBy: string;
  createdAt: string;
};
