import { useT } from "@/shared/i18n";
import { ConfirmButton } from "@/shared/ui";
import { useDeletePartner } from "../model/useDeletePartner";

export const DeletePartnerButton = ({ id, onDeleted }: { id: string; onDeleted: () => void }) => {
  const t = useT();
  const { remove, pending, error } = useDeletePartner(onDeleted);
  return (
    <ConfirmButton
      label={t("admin.delete")}
      question={t("admin.deletePartnerConfirm")}
      confirmLabel={t("admin.deleteConfirmYes")}
      cancelLabel={t("admin.cancel")}
      onConfirm={() => void remove(id)}
      pending={pending}
      error={error}
    />
  );
};
