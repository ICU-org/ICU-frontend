import { useCallback, useEffect, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { getAdminAbout, saveAbout, type AboutData, type AdminAbout } from "@/entities/About";
import { getErrorMessage } from "@/shared/lib";

type State = { status: "loading" } | { status: "error"; error: string } | { status: "ready"; about: AdminAbout | null };

export function useAboutEditor() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminAbout()
      .then((about) => {
        if (!cancelled) setState({ status: "ready", about });
      })
      .catch((err) => {
        if (!cancelled && !expireOnUnauthorized(err)) setState({ status: "error", error: getErrorMessage(err, "admin.loadFailed") });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  /** true — сохранено. */
  const save = useCallback(async (data: AboutData) => {
    setSaveError(null);
    setSavedAt(null);
    try {
      const about = await saveAbout(data);
      setState({ status: "ready", about });
      setSavedAt(about?.updatedAt ?? null);
      return true;
    } catch (err) {
      if (!expireOnUnauthorized(err)) setSaveError(getErrorMessage(err, "admin.saveFailed"));
      return false;
    }
  }, []);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((a) => a + 1);
    },
    save,
    saveError,
    savedAt,
  };
}
