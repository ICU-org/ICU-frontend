import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

export const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => (
  <textarea className={cn("block w-full resize-y py-2 rounded border border-line bg-surface px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger", className)} {...props} />
);
