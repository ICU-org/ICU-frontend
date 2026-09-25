import { useCallback, useEffect, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { listAdminPartners, type AdminPartner } from "@/entities/Partner";
import { getErrorMessage } from "@/shared/lib";

export function useAdminPartners() {
  const [items, setItems] = useState<AdminPartner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [loadedVersion, setLoadedVersion] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminPartners()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoadedVersion(version);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { items, error, loading: loadedVersion !== version, reload };
}
