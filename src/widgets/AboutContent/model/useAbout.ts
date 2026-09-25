import { useEffect, useState } from "react";
import { getAbout, type About } from "@/entities/About";
import { useLocale } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/lib";

/** «О нас» на языке интерфейса; null — ещё не заполнено. */
export function useAbout() {
  const { locale } = useLocale();
  const [about, setAbout] = useState<About | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${locale}|${attempt}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!locale) return;
    let cancelled = false;
    getAbout(locale)
      .then((data) => {
        if (cancelled) return;
        setAbout(data);
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

  return { about, error, loading: loadedKey !== requestKey, retry: () => setAttempt((a) => a + 1) };
}
