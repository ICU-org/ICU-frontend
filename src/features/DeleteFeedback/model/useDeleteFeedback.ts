import { useCallback, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { deleteFeedback } from "@/entities/Feedback";
import { getErrorMessage, getErrorStatus } from "@/shared/lib";

export function useDeleteFeedback(onDeleted: () => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: string) => {
      setPending(true);
      setError(null);
      try {
        await deleteFeedback(id);
        onDeleted();
      } catch (err) {
        // уже удалил другой админ — цель достигнута, просто обновить список
        if (getErrorStatus(err) === 404) onDeleted();
        else if (!expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.deleteFailed"));
      } finally {
        setPending(false);
      }
    },
    [onDeleted]
  );

  return { remove, pending, error };
}
