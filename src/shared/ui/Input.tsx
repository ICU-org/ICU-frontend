import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

export const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <input className={cn("block min-h-11 w-full py-2 rounded border border-line bg-surface px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger", className)} {...props} />
);
