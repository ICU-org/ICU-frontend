import { useState } from "react";
import { cn } from "@/shared/lib";
import { Button } from "./Button";

type Props = {
  label: string;
  /** Вопрос перед действием: «Удалить навсегда?» */
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
  className?: string;
};

/** Опасное действие — только после подтверждения в той же строке, без окна браузера. */
export const ConfirmButton = ({ label, question, confirmLabel, cancelLabel, onConfirm, pending, error, className }: Props) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="ghost" className={cn("text-danger hover:text-danger", className)} onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div role="group" aria-label={label} className="flex max-w-56 flex-col items-end gap-1 text-right">
      <p className="text-xs text-danger">{question}</p>
      <div className="flex gap-1">
        <Button variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
          {cancelLabel}
        </Button>
        <Button disabled={pending} className="bg-danger hover:bg-danger/90" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
