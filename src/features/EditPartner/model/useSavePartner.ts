import { useCallback, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { createPartner, updatePartner, type AdminPartner, type PartnerInput } from "@/entities/Partner";
import { getErrorMessage } from "@/shared/lib";

/** Создать (id нет) или изменить партнёра. Возвращает сохранённого или null. */
export function useSavePartner() {
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (id: string | undefined, input: PartnerInput): Promise<AdminPartner | null> => {
    setError(null);
    try {
      return id ? await updatePartner(id, input) : await createPartner(input);
    } catch (err) {
      if (!expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.saveFailed"));
      return null;
    }
  }, []);

  return { save, error };
}
