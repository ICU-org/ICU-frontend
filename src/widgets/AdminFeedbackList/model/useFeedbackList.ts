import { useCallback, useEffect, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { listFeedback, type FeedbackFilter, type FeedbackItem } from "@/entities/Feedback";
import { getErrorMessage } from "@/shared/lib";
import { PAGE_SIZE } from "../config/filters";

export function useFeedbackList() {
  const [filter, setFilterState] = useState<FeedbackFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // счётчик перезагрузок: после исключения запись может уйти из текущего фильтра
  const [version, setVersion] = useState(0);
  // загрузка идёт, пока последний ответ пришёл не на текущие параметры
  const requestKey = `${page}|${filter}|${version}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    listFeedback({ page, pageSize: PAGE_SIZE, filter })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(`${page}|${filter}|${version}`);
      });
    return () => {
      cancelled = true;
    };
  }, [page, filter, version]);

  const setFilter = useCallback((next: FeedbackFilter) => {
    setFilterState(next);
    setPage(1);
  }, []);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { items, total, page, pages, setPage, filter, setFilter, loading, error, reload };
}
