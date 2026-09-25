import { useCallback, useEffect, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { listExportBatches, type ExportBatch } from "@/entities/Feedback";
import { getErrorMessage } from "@/shared/lib";

export function useExportBatches() {
  const [items, setItems] = useState<ExportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listExportBatches()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { items, loading, error, reload };
}
