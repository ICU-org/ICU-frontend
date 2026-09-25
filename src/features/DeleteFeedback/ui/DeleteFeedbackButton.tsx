import { useT } from "@/shared/i18n";
import { ConfirmButton } from "@/shared/ui";
import { useDeleteFeedback } from "../model/useDeleteFeedback";

type Props = { id: string; onDeleted: () => void };

export const DeleteFeedbackButton = ({ id, onDeleted }: Props) => {
  const t = useT();
  const { remove, pending, error } = useDeleteFeedback(onDeleted);
  return (
    <ConfirmButton
      label={t("admin.delete")}
      question={t("admin.deleteConfirm")}
      confirmLabel={t("admin.deleteConfirmYes")}
      cancelLabel={t("admin.cancel")}
      onConfirm={() => void remove(id)}
      pending={pending}
      error={error}
    />
  );
};
