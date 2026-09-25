import { useCallback, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { downloadFeedbackExport } from "@/entities/Feedback";
import { getErrorMessage, saveFile } from "@/shared/lib";

export function useExportFeedback(onExported: () => void) {
  const [error, setError] = useState<string | null>(null);
  const [lastCount, setLastCount] = useState<number | null>(null);

  const exportPeriod = useCallback(
    async (from: string, to: string) => {
      setError(null);
      setLastCount(null);
      try {
        const { blob, fileName, count } = await downloadFeedbackExport(from, to);
        saveFile(blob, fileName);
        setLastCount(count);
        onExported();
      } catch (err) {
        if (!expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.exportFailed"));
      }
    },
    [onExported]
  );

  return { exportPeriod, error, lastCount };
}
