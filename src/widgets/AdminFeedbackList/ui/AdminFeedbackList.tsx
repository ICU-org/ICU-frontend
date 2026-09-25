import { useRef } from "react";
import { DeleteFeedbackButton } from "@/features/DeleteFeedback";
import { ExclusionToggle } from "@/features/ToggleFeedbackExclusion";
import type { FeedbackFilter } from "@/entities/Feedback";
import { useLocale, useT } from "@/shared/i18n";
import { cn, formatDateTime } from "@/shared/lib";
import { Button, Select, Spinner } from "@/shared/ui";
import { FILTERS } from "../config/filters";
import { useFeedbackList } from "../model/useFeedbackList";

export const AdminFeedbackList = () => {
  const t = useT();
  const { locale } = useLocale();
  const { items, total, page, pages, setPage, filter, setFilter, loading, error, reload } = useFeedbackList();
  const titleRef = useRef<HTMLHeadingElement>(null);
  /** Строка исчезла вместе с нажатой кнопкой — фокус на заголовок, а не в начало страницы. */
  const onDeleted = () => {
    reload();
    titleRef.current?.focus();
  };

  return (
    <section aria-labelledby="feedback-list-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="feedback-list-title" ref={titleRef} tabIndex={-1} className="text-xl font-semibold focus:outline-none">
            {t("admin.feedbackTitle")}
          </h2>
          <p className="text-sm text-muted">{t("admin.total", { count: total })}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          {t("admin.filterLabel")}
          <Select value={filter} onChange={(e) => setFilter(e.target.value as FeedbackFilter)}>
            {FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
          {error}
          <Button variant="ghost" onClick={reload}>
            {t("common.retry")}
          </Button>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="py-8 text-center">
          <Spinner />
        </div>
      ) : items.length === 0 && !error ? (
        <p className="rounded border border-line bg-card p-5 text-muted">{t("admin.empty")}</p>
      ) : (
        <ul className={cn("space-y-2", loading && "opacity-60")} aria-busy={loading}>
          {items.map((item) => {
            const excluded = item.excludedAt !== null;
            return (
              <li key={item.id} className="flex gap-3 rounded border border-line bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">
                    {formatDateTime(item.createdAt, locale)}
                    {excluded && (
                      <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-text">{t("admin.excludedBadge")}</span>
                    )}
                  </p>
                  <p className={cn("mt-1 whitespace-pre-wrap break-words", excluded && "text-muted line-through")}>
                    {item.message}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ExclusionToggle item={item} onChanged={reload} />
                  <DeleteFeedbackButton id={item.id} onDeleted={onDeleted} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-2" aria-label={t("admin.page", { page, pages })}>
          <Button variant="ghost" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
            {t("admin.prev")}
          </Button>
          <span className="text-sm text-muted">{t("admin.page", { page, pages })}</span>
          <Button variant="ghost" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>
            {t("admin.next")}
          </Button>
        </nav>
      )}
    </section>
  );
};
