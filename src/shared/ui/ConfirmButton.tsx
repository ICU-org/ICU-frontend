import { useEffect, useRef, useState } from "react";
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

/**
 * Опасное действие — только после подтверждения в той же строке, без окна браузера.
 * Фокус не теряется: при подтверждении — на «Отмена» (безопасный выбор),
 * после отмены — обратно на исходную кнопку.
 */
export const ConfirmButton = ({ label, question, confirmLabel, cancelLabel, onConfirm, pending, error, className }: Props) => {
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) return; // при первой отрисовке фокус не трогаем
    (confirming ? cancelRef : triggerRef).current?.focus();
  }, [confirming]);

  const toggle = (next: boolean) => {
    touched.current = true;
    setConfirming(next);
  };

  if (!confirming) {
    return (
      <Button ref={triggerRef} variant="ghost" className={cn("text-danger hover:text-danger", className)} onClick={() => toggle(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div role="group" aria-label={label} className="flex max-w-56 flex-col items-end gap-1 text-right">
      <p className="text-xs text-danger">{question}</p>
      <div className="flex gap-1">
        <Button ref={cancelRef} variant="ghost" disabled={pending} onClick={() => toggle(false)}>
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
