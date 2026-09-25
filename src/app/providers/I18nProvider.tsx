import { useEffect } from "react";
import { useI18nStatus } from "@/shared/i18n";
import { Button, FullScreenSpinner } from "@/shared/ui";

/*
 * Единственные тексты интерфейса вне словаря бэкенда: словарь не загрузился,
 * переводить нечем. Поэтому сразу на всех языках сайта.
 */
const UNAVAILABLE = ["Ծառայությունը ժամանակավորապես անհասանելի է", "Сервис временно недоступен", "Service temporarily unavailable"];
const RETRY = "↻ Կրկնել · Повторить · Retry";

/** Интерфейс рисуется только со словарём: до этого — пустой экран или ошибка. */
export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const { status, load } = useI18nStatus();

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  if (status === "ready") return <>{children}</>;
  if (status !== "error") return <FullScreenSpinner />;

  return (
    <div className="grid min-h-full place-items-center p-4 text-center">
      <div role="alert" className="space-y-4">
        {UNAVAILABLE.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <Button onClick={() => void load()}>{RETRY}</Button>
      </div>
    </div>
  );
};
