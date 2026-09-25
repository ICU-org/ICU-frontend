import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** tailwind-merge разрешает конфликты: внешний className="px-2" перебивает внутренний px-4. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
