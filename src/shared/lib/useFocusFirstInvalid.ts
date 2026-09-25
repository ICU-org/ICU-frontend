import { useEffect, useRef } from "react";

/**
 * Фокус на первое неверное поле формы — по порядку на экране. У react-hook-form
 * свой порядок — регистрации (поля через Controller регистрируются позже
 * обычных), и фокус уходил не туда; поэтому shouldFocusError: false и этот хук.
 * Эффект по submitCount — ошибки к этому моменту уже отрисованы (aria-invalid).
 */
export function useFocusFirstInvalid(submitCount: number) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (submitCount > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitCount]);
  return formRef;
}
