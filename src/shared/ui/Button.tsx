import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/shared/lib";

type Variant = "primary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent/90",
  ghost: "bg-transparent text-muted hover:bg-accent-soft hover:text-text",
};

const buttonClass = (variant: Variant, className?: string) =>
  cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    className
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export const Button = ({ variant = "primary", className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={buttonClass(variant, className)} {...props} />
);

/** Переход на другую страницу, выглядящий как кнопка. */
export const ButtonLink = ({ variant = "primary", className, ...props }: LinkProps & { variant?: Variant }) => (
  <Link className={buttonClass(variant, className)} {...props} />
);
