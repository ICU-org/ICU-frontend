import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AboutData, AdminAbout } from "@/entities/About";
import { useFieldError, useLocale, useT } from "@/shared/i18n";
import { formatDateTime, toLocalizedForm, useFocusFirstInvalid } from "@/shared/lib";
import { Button, Input, LocalizedField } from "@/shared/ui";
import { AboutSchema, type AboutValues } from "../zod/schema";

type Props = {
  about: AdminAbout | null;
  /** Несохранённое с прошлой (истёкшей) сессии — форма начинает с него. */
  draft: AboutData | null;
  showDraftNotice: boolean;
  onDiscardDraft: () => void;
  onSave: (data: AboutData) => Promise<boolean>;
  saveError: string | null;
  savedAt: string | null;
};

const MAX_STATS = 6;
const MAX_ACTIVITIES = 20;

export const AboutForm = ({ about, draft, showDraftNotice, onDiscardDraft, onSave, saveError, savedAt }: Props) => {
  const t = useT();
  const fieldError = useFieldError();
  const { locale, locales, defaultLocale } = useLocale();
  const codes = locales.map((l) => l.code);
  const data = draft ?? about?.data;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<AboutValues>({
    resolver: zodResolver(AboutSchema),
    shouldFocusError: false, // фокус — по порядку на экране, см. useFocusFirstInvalid
    defaultValues: {
      intro: toLocalizedForm(data?.intro, codes),
      stats: (data?.stats ?? []).map((s) => ({ value: s.value, label: toLocalizedForm(s.label, codes) })),
      // useFieldArray хранит объекты — пункт списка обёрнут в { text }
      activities: (data?.activities ?? []).map((a) => ({ text: toLocalizedForm(a, codes) })),
      contacts: {
        address: toLocalizedForm(data?.contacts.address, codes),
        hours: toLocalizedForm(data?.contacts.hours, codes),
        phone: data?.contacts.phone ?? "",
        email: data?.contacts.email ?? "",
      },
    },
  });
  const formRef = useFocusFirstInvalid(submitCount);
  const stats = useFieldArray({ control, name: "stats" });
  const activities = useFieldArray({ control, name: "activities" });

  const onSubmit = handleSubmit(async (values) => {
    await onSave({
      intro: values.intro,
      stats: values.stats,
      activities: values.activities.map((a) => a.text),
      contacts: {
        address: values.contacts.address,
        hours: values.contacts.hours,
        phone: values.contacts.phone || null,
        email: values.contacts.email || null,
      },
    });
  });

  const lp = { locales, requiredLocale: defaultLocale ?? "hy", requiredMark: t("admin.required") };
  // группа с рамкой — <section> + <h2>: <legend> в <fieldset> с рамкой браузер рисует поверх линии
  const box = "space-y-4 rounded border border-line bg-card p-5";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      {showDraftNotice && (
        <div role="status" className="flex flex-wrap items-center gap-2 rounded bg-accent-soft p-3 text-sm">
          {t("admin.draftRestored")}
          <Button variant="ghost" onClick={onDiscardDraft}>
            {t("admin.discardDraft")}
          </Button>
        </div>
      )}
      <div className={box}>
        <Controller
          name="intro"
          control={control}
          render={({ field }) => (
            <LocalizedField id="about-intro" required inputRef={field.ref} label={t("admin.aboutIntro")} value={field.value} onChange={field.onChange} multiline maxLength={1000} error={fieldError(errors.intro?.message)} {...lp} />
          )}
        />
      </div>

      <section className={box} aria-labelledby="about-stats-title">
        <h2 id="about-stats-title" className="text-lg font-semibold">
          {t("admin.aboutStats")}
        </h2>
        {stats.fields.map((item, i) => (
          <div key={item.id} className="space-y-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
            <div>
              <label htmlFor={`stat-${i}-value`} className="mb-1.5 block text-sm font-medium">
                {t("admin.statValue")}
              </label>
              <Input
                id={`stat-${i}-value`}
                maxLength={20}
                aria-invalid={Boolean(errors.stats?.[i]?.value)}
                aria-describedby={errors.stats?.[i]?.value ? `stat-${i}-value-error` : undefined}
                {...register(`stats.${i}.value`)}
              />
              {errors.stats?.[i]?.value && (
                <p id={`stat-${i}-value-error`} role="alert" className="mt-1.5 text-sm text-danger">
                  {fieldError(errors.stats[i]?.value?.message)}
                </p>
              )}
            </div>
            <Controller
              name={`stats.${i}.label`}
              control={control}
              render={({ field }) => (
                <LocalizedField id={`stat-${i}-label`} required inputRef={field.ref} label={t("admin.statLabel")} value={field.value} onChange={field.onChange} maxLength={80} error={fieldError(errors.stats?.[i]?.label?.message)} {...lp} />
              )}
            />
            <Button variant="ghost" className="text-danger" onClick={() => stats.remove(i)}>
              {t("admin.remove")}
            </Button>
          </div>
        ))}
        {stats.fields.length < MAX_STATS && (
          <Button variant="ghost" onClick={() => stats.append({ value: "", label: toLocalizedForm(null, codes) })}>
            + {t("admin.addStat")}
          </Button>
        )}
      </section>

      <section className={box} aria-labelledby="about-activities-title">
        <h2 id="about-activities-title" className="text-lg font-semibold">
          {t("admin.aboutActivities")}
        </h2>
        {activities.fields.map((item, i) => (
          <div key={item.id} className="space-y-2 border-t border-line pt-3 first:border-t-0 first:pt-0">
            <Controller
              name={`activities.${i}.text`}
              control={control}
              render={({ field }) => (
                <LocalizedField id={`activity-${i}`} required inputRef={field.ref} label={`${i + 1}.`} value={field.value} onChange={field.onChange} maxLength={200} error={fieldError(errors.activities?.[i]?.text?.message)} {...lp} />
              )}
            />
            <Button variant="ghost" className="text-danger" onClick={() => activities.remove(i)}>
              {t("admin.remove")}
            </Button>
          </div>
        ))}
        {activities.fields.length < MAX_ACTIVITIES && (
          <Button variant="ghost" onClick={() => activities.append({ text: toLocalizedForm(null, codes) })}>
            + {t("admin.addActivity")}
          </Button>
        )}
      </section>

      <section className={box} aria-labelledby="about-contacts-title">
        <h2 id="about-contacts-title" className="text-lg font-semibold">
          {t("admin.aboutContacts")}
        </h2>
        <Controller
          name="contacts.address"
          control={control}
          render={({ field }) => (
            <LocalizedField id="about-address" inputRef={field.ref} label={t("admin.aboutAddress")} value={field.value} onChange={field.onChange} maxLength={200} error={fieldError(errors.contacts?.address?.message)} {...lp} />
          )}
        />
        <Controller
          name="contacts.hours"
          control={control}
          render={({ field }) => (
            <LocalizedField id="about-hours" inputRef={field.ref} label={t("admin.aboutHours")} value={field.value} onChange={field.onChange} maxLength={100} error={fieldError(errors.contacts?.hours?.message)} {...lp} />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["phone", "admin.aboutPhone", "tel"],
              ["email", "admin.aboutEmail", "email"],
            ] as const
          ).map(([key, label, type]) => {
            const message = fieldError(errors.contacts?.[key]?.message);
            return (
              <div key={key}>
                <label htmlFor={`about-${key}`} className="mb-1.5 block text-sm font-medium">
                  {t(label)}
                </label>
                <Input
                  id={`about-${key}`}
                  type={type}
                  aria-invalid={Boolean(message)}
                  aria-describedby={message ? `about-${key}-error` : undefined}
                  {...register(`contacts.${key}`)}
                />
                {message && (
                  <p id={`about-${key}-error`} role="alert" className="mt-1.5 text-sm text-danger">
                    {message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {saveError && (
        <p role="alert" className="text-sm text-danger">
          {saveError}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("admin.saving") : t("admin.save")}
        </Button>
        {savedAt && (
          <p role="status" className="text-sm text-ok">
            {t("admin.saved")}
          </p>
        )}
        {about && (
          <p className="text-xs text-muted">{t("admin.lastSaved", { at: formatDateTime(about.updatedAt, locale), by: about.updatedBy })}</p>
        )}
      </div>
    </form>
  );
};
