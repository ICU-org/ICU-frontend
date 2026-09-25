import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldError, useT } from "@/shared/i18n";
import { Button, Textarea } from "@/shared/ui";
import { FeedbackSchema, MESSAGE_MAX_LENGTH, type FeedbackValues } from "../zod/schema";
import { useSubmitFeedback } from "../model/useSubmitFeedback";

const FIELD_ID = "feedback-message";

/** Компактная форма обращения: одно поле и кнопка. */
export const FeedbackForm = () => {
  const t = useT();
  const fieldError = useFieldError();
  const { status, error, submit, reset: resetStatus } = useSubmitFeedback();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackValues>({ resolver: zodResolver(FeedbackSchema), defaultValues: { message: "" } });

  // после отправки поле очищается — готово к следующему сообщению
  const onSubmit = handleSubmit(async ({ message }) => {
    if (await submit(message)) reset();
  });

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="text-ok">{t("feedback.sent")}</span>
        <Button variant="ghost" className="-ml-2 min-h-11 px-2" onClick={resetStatus}>
          {t("feedback.sendAnother")}
        </Button>
      </div>
    );
  }

  const messageError = fieldError(errors.message?.message);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <label htmlFor={FIELD_ID} className="sr-only">
        {t("feedback.messageLabel")}
      </label>
      <Textarea
        id={FIELD_ID}
        rows={3}
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder={t("feedback.messagePlaceholder")}
        aria-invalid={Boolean(messageError)}
        aria-describedby={messageError ? `${FIELD_ID}-error` : `${FIELD_ID}-note`}
        {...register("message")}
      />
      {messageError ? (
        <p id={`${FIELD_ID}-error`} role="alert" className="text-sm text-danger">
          {messageError}
        </p>
      ) : (
        <p id={`${FIELD_ID}-note`} className="text-xs text-muted">
          {t("feedback.anonymousNote")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? t("feedback.sending") : t("feedback.submit")}
      </Button>
    </form>
  );
};
