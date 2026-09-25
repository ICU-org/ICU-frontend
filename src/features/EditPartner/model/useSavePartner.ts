import { useCallback, useState } from "react";
import { expireOnUnauthorized, useAdminSession } from "@/entities/AdminSession";
import { createPartner, updatePartner, type AdminPartner, type PartnerInput } from "@/entities/Partner";
import { getErrorMessage, saveDraft } from "@/shared/lib";

/** Ключ черновика формы партнёра: id или "new". */
export const partnerDraftKey = (id: string | undefined) => `partner:${id ?? "new"}`;

/** Создать (id нет) или изменить партнёра. Возвращает сохранённого или null. */
export function useSavePartner() {
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (id: string | undefined, input: PartnerInput): Promise<AdminPartner | null> => {
    setError(null);
    try {
      return id ? await updatePartner(id, input) : await createPartner(input);
    } catch (err) {
      // сессия истекла — введённое сохраняется, после входа форма его восстановит
      const owner = useAdminSession.getState().admin?.id;
      if (!expireOnUnauthorized(err, () => owner && saveDraft(partnerDraftKey(id), input, owner))) {
        setError(getErrorMessage(err, "admin.saveFailed"));
      }
      return null;
    }
  }, []);

  return { save, error };
}
