import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminSession } from "@/entities/AdminSession";
import { PARTNER_SERVICES, PARTNER_TYPES, SERVICE_LABEL, TYPE_LABEL, type AdminPartner } from "@/entities/Partner";
import { useFieldError, useLocale, useT } from "@/shared/i18n";
import { clearDraft, readDraft, toLocalizedForm, useFocusFirstInvalid } from "@/shared/lib";
import { Button, Input, LocalizedField, Select } from "@/shared/ui";
import { PartnerSchema, type PartnerValues } from "../zod/schema";
import { partnerDraftKey, useSavePartner } from "../model/useSavePartner";

type Props = {
  /** Нет — новый партнёр. */
  partner?: AdminPartner;
  onSaved: (partner: AdminPartner) => void;
  onCancel: () => void;
};

/**
 * Поле числа — текстовое: у type="number" браузер отдаёт "" на «12e», и
 * ошибочный ввод молча становился пустым. Пусто → null, целое → число,
 * остальное → NaN (схема покажет «Нужно целое число»).
 */
const toIntOrNull = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return /^-?\d+$/.test(text) ? Number(text) : Number.NaN;
};

export const PartnerForm = ({ partner, onSaved, onCancel }: Props) => {
  const t = useT();
  const fieldError = useFieldError();
  const { locales, defaultLocale } = useLocale();
  const codes = locales.map((l) => l.code);
  const { save, error } = useSavePartner();

  const fromServer = (): PartnerValues => ({
    name: toLocalizedForm(partner?.name, codes),
    description: toLocalizedForm(partner?.description, codes),
    type: partner?.type ?? "CARRIER",
    services: partner?.services ?? [],
    vehicleCount: partner?.vehicleCount ?? null,
    partnerSince: partner?.partnerSince ?? null,
    sortOrder: partner?.sortOrder ?? 0,
    isVisible: partner?.isVisible ?? true,
  });
  // черновик остался после истёкшей сессии — форма начинает с него
  const draftKey = partnerDraftKey(partner?.id);
  const adminId = useAdminSession((s) => s.admin?.id);
  const [draft] = useState(() => {
    const value = readDraft<PartnerValues>(draftKey, adminId);
    // форма могла поменяться после выпуска — непохожий черновик не подставляем
    if (value && !PartnerSchema.safeParse(value).success) {
      clearDraft(draftKey);
      return null;
    }
    return value;
  });
  const [showDraftNotice, setShowDraftNotice] = useState(Boolean(draft));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<PartnerValues>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: draft ?? fromServer(),
    shouldFocusError: false, // фокус — по порядку на экране, см. useFocusFirstInvalid
  });
  const formRef = useFocusFirstInvalid(submitCount);

  const discardDraft = () => {
    clearDraft(draftKey);
    setShowDraftNotice(false);
    reset(fromServer());
  };

  const onSubmit = handleSubmit(async (values) => {
    const saved = await save(partner?.id, values);
    if (saved) {
      clearDraft(draftKey);
      onSaved(saved);
    }
  });

  const prefix = partner?.id ?? "new";
  const localizedProps = { locales, requiredLocale: defaultLocale ?? "hy", requiredMark: t("admin.required") };
  const numberError = (key: "vehicleCount" | "partnerSince" | "sortOrder") => fieldError(errors[key]?.message);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5 rounded border border-line bg-card p-5">
      {showDraftNotice && (
        <div role="status" className="flex flex-wrap items-center gap-2 rounded bg-accent-soft p-3 text-sm">
          {t("admin.draftRestored")}
          <Button variant="ghost" onClick={discardDraft}>
            {t("admin.discardDraft")}
          </Button>
        </div>
      )}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <LocalizedField
            id={`${prefix}-name`}
            label={t("admin.partnerName")}
            value={field.value}
            onChange={field.onChange}
            inputRef={field.ref}
            required
            maxLength={120}
            error={fieldError(errors.name?.message)}
            {...localizedProps}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <LocalizedField
            id={`${prefix}-description`}
            label={t("admin.partnerDescription")}
            value={field.value}
            onChange={field.onChange}
            inputRef={field.ref}
            multiline
            maxLength={600}
            error={fieldError(errors.description?.message)}
            {...localizedProps}
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-type`} className="mb-1.5 block text-sm font-medium">
            {t("admin.partnerType")}
          </label>
          <Select id={`${prefix}-type`} className="w-full" {...register("type")}>
            {PARTNER_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(TYPE_LABEL[type])}
              </option>
            ))}
          </Select>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">{t("admin.partnerServices")}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {PARTNER_SERVICES.map((service) => (
              <label key={service} className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" value={service} className="size-4 accent-accent" {...register("services")} />
                {t(SERVICE_LABEL[service])}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["vehicleCount", "admin.vehicleCount"],
            ["partnerSince", "admin.partnerSince"],
            ["sortOrder", "admin.sortOrder"],
          ] as const
        ).map(([key, label]) => {
          const message = numberError(key);
          const id = `${prefix}-${key}`;
          return (
            <div key={key}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                {t(label)}
              </label>
              <Input
                id={id}
                type="text"
                // порядок бывает отрицательным — нужна клавиатура с минусом
                inputMode={key === "sortOrder" ? "text" : "numeric"}
                autoComplete="off"
                aria-invalid={Boolean(message)}
                aria-describedby={message ? `${id}-error` : undefined}
                {...register(key, {
                  setValueAs: key === "sortOrder" ? (v) => toIntOrNull(v) ?? 0 : toIntOrNull,
                })}
              />
              {message && (
                <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger">
                  {message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-accent" {...register("isVisible")} />
        {t("admin.isVisible")}
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("admin.saving") : t("admin.save")}
        </Button>
        <Button variant="ghost" onClick={() => {
            clearDraft(draftKey);
            onCancel();
          }}>
          {t("admin.cancel")}
        </Button>
      </div>
    </form>
  );
};
