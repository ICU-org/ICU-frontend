import type { FeedbackItem } from "@/entities/Feedback";
import { useT } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useToggleExclusion } from "../model/useToggleExclusion";

type Props = { item: FeedbackItem; onChanged: (item: FeedbackItem) => void };

/** Исключить обращение из выгрузки для мэрии (мусор) или вернуть. */
export const ExclusionToggle = ({ item, onChanged }: Props) => {
  const t = useT();
  const { toggle, pending, error } = useToggleExclusion(onChanged);
  const excluded = item.excludedAt !== null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="ghost" disabled={pending} onClick={() => void toggle(item)} aria-pressed={excluded}>
        {excluded ? t("admin.include") : t("admin.exclude")}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
