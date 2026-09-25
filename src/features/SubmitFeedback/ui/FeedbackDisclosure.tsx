import { useId, useState } from "react";
import { useT } from "@/shared/i18n";
import { FeedbackForm } from "./FeedbackForm";

/**
 * Неброская строка «Есть жалоба или предложение?» — по нажатию раскрывается
 * компактная форма. Живёт только в разделе «Городской транспорт».
 */
export const FeedbackDisclosure = () => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="border-t border-line pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-2 rounded px-1 text-sm text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span aria-hidden>✎</span>
        {open ? t("feedback.hide") : t("feedback.toggle")}
      </button>
      {open && (
        <div id={panelId} className="mt-2 max-w-xl">
          <FeedbackForm />
        </div>
      )}
    </section>
  );
};
