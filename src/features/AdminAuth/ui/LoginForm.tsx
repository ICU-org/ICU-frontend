import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminSession } from "@/entities/AdminSession";
import { useFieldError, useT } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/lib";
import { Button, Input } from "@/shared/ui";
import { LoginSchema, type LoginValues } from "../zod/schema";

export const LoginForm = () => {
  const t = useT();
  const fieldError = useFieldError();
  const signIn = useAdminSession((s) => s.signIn);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema), defaultValues: { login: "", password: "" } });

  const onSubmit = handleSubmit(async ({ login, password }) => {
    setError(null);
    try {
      await signIn(login, password);
    } catch (err) {
      setError(getErrorMessage(err, "errors.INTERNAL"));
    }
  });

  const loginError = fieldError(errors.login?.message);
  const passwordError = fieldError(errors.password?.message);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded border border-line bg-card p-5">
      <div>
        <label htmlFor="admin-login" className="mb-1.5 block text-sm font-medium">
          {t("admin.login")}
        </label>
        <Input
          id="admin-login"
          autoComplete="username"
          autoCapitalize="none"
          aria-invalid={Boolean(loginError)}
          aria-describedby={loginError ? "admin-login-error" : undefined}
          {...register("login")}
        />
        {loginError && (
          <p id="admin-login-error" role="alert" className="mt-1.5 text-sm text-danger">
            {loginError}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
          {t("admin.password")}
        </label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "admin-password-error" : undefined}
          {...register("password")}
        />
        {passwordError && (
          <p id="admin-password-error" role="alert" className="mt-1.5 text-sm text-danger">
            {passwordError}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("admin.signingIn") : t("admin.signIn")}
      </Button>
    </form>
  );
};
