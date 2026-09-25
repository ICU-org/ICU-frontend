import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

export const Select = ({ className, ...props }: ComponentProps<"select">) => (
  <select className={cn("min-h-11 py-2 rounded border border-line bg-surface px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger", className)} {...props} />
);
