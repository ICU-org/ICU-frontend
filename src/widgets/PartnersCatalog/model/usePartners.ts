import { useEffect, useState } from "react";
import { listPartners, type Partner } from "@/entities/Partner";
import { useLocale } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/lib";

/** Партнёры на языке интерфейса; при смене языка — заново. */
export function usePartners() {
  const { locale } = useLocale();
  const [items, setItems] = useState<Partner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // загрузка идёт, пока последний ответ — не на текущие язык и попытку
  const requestKey = `${locale}|${attempt}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!locale) return;
    let cancelled = false;
    listPartners(locale)
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "errors.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(`${locale}|${attempt}`);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, attempt]);

  return { items, error, loading: loadedKey !== requestKey, retry: () => setAttempt((a) => a + 1) };
}
