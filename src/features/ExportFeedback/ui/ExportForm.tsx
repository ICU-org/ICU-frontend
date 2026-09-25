import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldError, useT } from "@/shared/i18n";
import { todayInZone } from "@/shared/lib";
import { Button, Input } from "@/shared/ui";
import { ExportSchema, type ExportValues } from "../zod/schema";
import { useExportFeedback } from "../model/useExportFeedback";

/** По умолчанию — с 1-го числа текущего месяца по сегодня (по Еревану). */
const defaultPeriod = (): ExportValues => {
  const today = todayInZone();
  return { from: `${today.slice(0, 8)}01`, to: today };
};

export const ExportForm = ({ onExported }: { onExported: () => void }) => {
  const t = useT();
  const fieldError = useFieldError();
  const { exportPeriod, error, lastCount } = useExportFeedback(onExported);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExportValues>({ resolver: zodResolver(ExportSchema), defaultValues: defaultPeriod() });

  const onSubmit = handleSubmit(({ from, to }) => exportPeriod(from, to));
  const toError = fieldError(errors.to?.message) ?? fieldError(errors.from?.message);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="export-from" className="mb-1.5 block text-sm font-medium">
            {t("admin.periodFrom")}
          </label>
          <Input id="export-from" type="date" max={todayInZone()} {...register("from")} />
        </div>
        <div>
          <label htmlFor="export-to" className="mb-1.5 block text-sm font-medium">
            {t("admin.periodTo")}
          </label>
          <Input
            id="export-to"
            type="date"
            max={todayInZone()}
            aria-invalid={Boolean(toError)}
            aria-describedby={toError ? "export-period-error" : undefined}
            {...register("to")}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("admin.exporting") : t("admin.exportButton")}
        </Button>
      </div>
      {toError && (
        <p id="export-period-error" role="alert" className="text-sm text-danger">
          {toError}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {lastCount !== null && (
        <p role="status" className="text-sm text-ok">
          {t("admin.exportDone", { count: lastCount })}
        </p>
      )}
    </form>
  );
};
