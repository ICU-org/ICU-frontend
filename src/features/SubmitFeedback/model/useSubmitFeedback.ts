import { useCallback, useState } from "react";
import { sendFeedback } from "@/entities/Feedback";
import { getErrorMessage } from "@/shared/lib";

type Status = "idle" | "sending" | "sent" | "error";

export function useSubmitFeedback() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  /** true — сообщение принято сервером. */
  const submit = useCallback(async (message: string) => {
    setStatus("sending");
    setError(null);
    try {
      await sendFeedback(message);
      setStatus("sent");
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "errors.submitFailed"));
      setStatus("error");
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, submit, reset };
}
