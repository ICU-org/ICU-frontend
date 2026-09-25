import { useT } from "@/shared/i18n";
import { Button, Spinner } from "@/shared/ui";
import { useAboutEditor } from "../model/useAboutEditor";
import { AboutForm } from "./AboutForm";

export const AboutEditor = () => {
  const t = useT();
  const { state, retry, save, saveError, savedAt } = useAboutEditor();

  if (state.status === "loading") {
    return (
      <div className="py-8 text-center">
        <Spinner />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
        {state.error}
        <Button variant="ghost" onClick={retry}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }
  return <AboutForm about={state.about} onSave={save} saveError={saveError} savedAt={savedAt} />;
};
