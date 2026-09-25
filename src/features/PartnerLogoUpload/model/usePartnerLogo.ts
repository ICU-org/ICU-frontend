import { useCallback, useState } from "react";
import { expireOnUnauthorized } from "@/entities/AdminSession";
import { removePartnerLogo, uploadPartnerLogo, type AdminPartner } from "@/entities/Partner";
import { getErrorMessage } from "@/shared/lib";

export function usePartnerLogo(onChanged: (partner: AdminPartner) => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<AdminPartner>) => {
      setPending(true);
      setError(null);
      try {
        onChanged(await action());
      } catch (err) {
        if (!expireOnUnauthorized(err)) setError(getErrorMessage(err, "admin.saveFailed"));
      } finally {
        setPending(false);
      }
    },
    [onChanged]
  );

  return {
    upload: (id: string, file: File) => run(() => uploadPartnerLogo(id, file)),
    remove: (id: string) => run(() => removePartnerLogo(id)),
    pending,
    error,
  };
}
