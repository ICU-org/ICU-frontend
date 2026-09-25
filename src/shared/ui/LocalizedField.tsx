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
  /** «обязательно» на языке интерфейса. */
  requiredMark: string;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
};

/** Один текст на всех языках сайта: поле на язык, обязательный — первым. */
export const LocalizedField = ({ id, label, value, onChange, locales, requiredLocale, requiredMark, multiline, maxLength, error }: Props) => {
  const ordered = [...locales].sort((a, b) => Number(b.code === requiredLocale) - Number(a.code === requiredLocale));
  const errorId = `${id}-error`;

  return (
    <fieldset className="space-y-2" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {ordered.map(({ code, name }) => {
        const fieldId = `${id}-${code}`;
        const required = code === requiredLocale;
        const props = {
          id: fieldId,
          value: value[code] ?? "",
          maxLength,
          lang: code,
          "aria-invalid": required && Boolean(error),
          onChange: (e: { target: { value: string } }) => onChange({ ...value, [code]: e.target.value }),
        };
        return (
          <div key={code}>
            <label htmlFor={fieldId} className="mb-1 block text-xs text-muted">
              {name}
              {required && ` · ${requiredMark}`}
            </label>
            {multiline ? <Textarea rows={3} {...props} /> : <Input {...props} />}
          </div>
        );
      })}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
};
