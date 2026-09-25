import { ExportForm } from "@/features/ExportFeedback";
import { useLocale, useT } from "@/shared/i18n";
import { formatDate, formatDateTime } from "@/shared/lib";
import { Spinner } from "@/shared/ui";
import { useExportBatches } from "../model/useExportBatches";

/** periodTo не включается: последний день периода — за миллисекунду до него. */
const lastDay = (periodTo: string) => new Date(new Date(periodTo).getTime() - 1);

export const AdminExportPanel = () => {
  const t = useT();
  const { locale } = useLocale();
  const { items, loading, error, reload } = useExportBatches();

  return (
    <section aria-labelledby="export-title" className="space-y-4 rounded border border-line bg-card p-5">
      <div>
        <h2 id="export-title" className="text-xl font-semibold">
          {t("admin.exportTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("admin.exportHint")}</p>
      </div>

      <ExportForm onExported={reload} />

      <div>
        <h3 className="mb-2 font-medium">{t("admin.historyTitle")}</h3>
        {loading ? (
          <Spinner className="size-5" />
        ) : error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">{t("admin.historyEmpty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="py-1 pr-3 font-medium">{t("admin.historyPeriod")}</th>
                  <th scope="col" className="py-1 pr-3 font-medium">{t("admin.historyCount")}</th>
                  <th scope="col" className="py-1 pr-3 font-medium">{t("admin.historyBy")}</th>
                  <th scope="col" className="py-1 font-medium">{t("admin.historyAt")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((batch) => (
                  <tr key={batch.id} className="border-t border-line">
                    <td className="whitespace-nowrap py-1.5 pr-3">
                      {formatDate(batch.periodFrom, locale)} – {formatDate(lastDay(batch.periodTo), locale)}
                    </td>
                    <td className="py-1.5 pr-3">{batch.count}</td>
                    <td className="py-1.5 pr-3">{batch.exportedBy}</td>
                    <td className="whitespace-nowrap py-1.5">{formatDateTime(batch.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">{t("admin.retentionNote")}</p>
    </section>
  );
};
