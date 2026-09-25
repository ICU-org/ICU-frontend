import { useRef } from "react";
import { PartnerLogo, type AdminPartner } from "@/entities/Partner";
import { getDefaultLocale, useT } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { usePartnerLogo } from "../model/usePartnerLogo";

type Props = { partner: AdminPartner; onChanged: (partner: AdminPartner) => void };

export const PartnerLogoUpload = ({ partner, onChanged }: Props) => {
  const t = useT();
  const { upload, remove, pending, error } = usePartnerLogo(onChanged);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `logo-${partner.id}`;

  return (
    <div className="space-y-2 rounded border border-line bg-card p-5">
      <p className="text-sm font-medium">{t("admin.logo")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <PartnerLogo name={partner.name[getDefaultLocale()] ?? ""} logoUrl={partner.logoUrl} className="size-16" />
        {/* настоящий input спрятан, его открывает label, оформленный как кнопка */}
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center rounded bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent/90 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
        >
          {t("admin.uploadLogo")}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = ""; // тот же файл можно выбрать снова
              if (file) void upload(partner.id, file);
            }}
          />
        </label>
        {partner.logoUrl && (
          <Button
            variant="ghost"
            disabled={pending}
            // кнопка исчезнет вместе с логотипом — фокус на «Загрузить логотип»
            onClick={() => void remove(partner.id).then((ok) => ok && inputRef.current?.focus())}
          >
            {t("admin.removeLogo")}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted">{t("admin.logoHint")}</p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
