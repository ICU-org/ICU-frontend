import { useCallback, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { setFeedbackExcluded, type FeedbackItem } from "@/entities/Feedback";
import { getErrorMessage } from "@/shared/lib";

export function useToggleExclusion(onChanged: (item: FeedbackItem) => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(
    async (item: FeedbackItem) => {
      setPending(true);
      setError(null);
      try {
        onChanged(await setFeedbackExcluded(item.id, item.excludedAt === null));
      } catch (err) {
        if (!expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.updateFailed"));
      } finally {
        setPending(false);
      }
    },
    [onChanged]
  );

  return { toggle, pending, error };
}
