import type { Ref } from "react";
import type { Localized } from "@/shared/lib";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

type Props = {
  id: string;
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  /** Языки сайта; первым показывается обязательный. */
  locales: ReadonlyArray<{ code: string; name: string }>;
  requiredLocale: string;
  /** Поле обязательно — тогда у обязательного языка пометка «обязательно». */
  required?: boolean;
  /** «обязательно» на языке интерфейса. */
  requiredMark: string;
  /** ref поля обязательного языка — форма ставит туда фокус при ошибке. */
  inputRef?: Ref<HTMLInputElement & HTMLTextAreaElement>;
  multiline?: boolean;
  maxLength?: number;
  /** Ошибка относится к обязательному языку и показывается под его полем. */
  error?: string;
};

/** Один текст на всех языках сайта: поле на язык, обязательный — первым. */
export const LocalizedField = ({
  id,
  label,
  value,
  onChange,
  locales,
  requiredLocale,
  required = false,
  requiredMark,
  inputRef,
  multiline,
  maxLength,
  error,
}: Props) => {
  const ordered = [...locales].sort((a, b) => Number(b.code === requiredLocale) - Number(a.code === requiredLocale));
  const errorId = `${id}-error`;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {ordered.map(({ code, name }) => {
        const fieldId = `${id}-${code}`;
        const main = code === requiredLocale;
        const props = {
          id: fieldId,
          value: value[code] ?? "",
          maxLength,
          lang: code,
          ...(main && {
            ref: inputRef,
            "aria-invalid": Boolean(error),
            "aria-describedby": error ? errorId : undefined,
          }),
          onChange: (e: { target: { value: string } }) => onChange({ ...value, [code]: e.target.value }),
        };
        return (
          <div key={code}>
            <label htmlFor={fieldId} className="mb-1 block text-xs text-muted">
              {name}
              {main && required && ` · ${requiredMark}`}
            </label>
            {multiline ? <Textarea rows={3} {...props} /> : <Input {...props} />}
            {main && error && (
              <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
};
