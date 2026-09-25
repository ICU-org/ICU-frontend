import { useCallback, useEffect, useState } from "react";
import { expireOnUnauthorized, useAdminSession } from "@/entities/AdminSession";
import { getAdminAbout, saveAbout, type AboutData, type AdminAbout } from "@/entities/About";
import { getErrorMessage, saveDraft } from "@/shared/lib";

export const ABOUT_DRAFT_KEY = "about";

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
      // сессия истекла — введённое сохраняется, после входа форма его восстановит
      const owner = useAdminSession.getState().admin?.id;
      if (!expireOnUnauthorized(err, () => owner && saveDraft(ABOUT_DRAFT_KEY, data, owner))) {
        setSaveError(getErrorMessage(err, "admin.saveFailed"));
      }
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
