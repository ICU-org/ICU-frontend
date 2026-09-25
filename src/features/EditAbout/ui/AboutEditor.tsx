import { useT } from "@/shared/i18n";
import { Button, Spinner } from "@/shared/ui";
import { useState } from "react";
import type { AboutData } from "@/entities/About";
import { useAdminSession } from "@/entities/AdminSession";
import { clearDraft, readDraft } from "@/shared/lib";
import { ABOUT_DRAFT_KEY, useAboutEditor } from "../model/useAboutEditor";
import { AboutForm } from "./AboutForm";

/** Черновик «О нас» той же формы, что сохраняется (AboutData)? */
const looksLikeAbout = (value: unknown): value is AboutData => {
  const v = value as Partial<AboutData> | null;
  return Boolean(v && typeof v.intro === "object" && Array.isArray(v.stats) && Array.isArray(v.activities) && typeof v.contacts === "object");
};

export const AboutEditor = () => {
  const t = useT();
  const { state, retry, save, saveError, savedAt } = useAboutEditor();
  const adminId = useAdminSession((s) => s.admin?.id);
  const [draft] = useState(() => {
    const value = readDraft<AboutData>(ABOUT_DRAFT_KEY, adminId);
    // форма могла поменяться после выпуска — непохожий черновик не подставляем
    if (value && !looksLikeAbout(value)) {
      clearDraft(ABOUT_DRAFT_KEY);
      return null;
    }
    return value;
  });
  const [showDraftNotice, setShowDraftNotice] = useState(Boolean(draft));
  // «Отбросить» пересоздаёт форму с данными сервера; сохранение — нет (фокус остаётся на месте)
  const [formVersion, setFormVersion] = useState(0);

  const discardDraft = () => {
    clearDraft(ABOUT_DRAFT_KEY);
    setShowDraftNotice(false);
    setFormVersion((v) => v + 1);
  };
  const saveAndForget = async (data: AboutData) => {
    const ok = await save(data);
    if (ok) {
      clearDraft(ABOUT_DRAFT_KEY);
      setShowDraftNotice(false);
    }
    return ok;
  };

  if (state.status === "loading") {
    return (
      <div className="py-8 text-center">
        <Spinner />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
        {state.error}
        <Button variant="ghost" onClick={retry}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }
  return (
    <AboutForm
      key={formVersion}
      about={state.about}
      draft={formVersion === 0 ? draft : null}
      showDraftNotice={showDraftNotice}
      onDiscardDraft={discardDraft}
      onSave={saveAndForget}
      saveError={saveError}
      savedAt={savedAt}
    />
  );
};
