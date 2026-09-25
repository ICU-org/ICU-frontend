import { cn } from "@/shared/lib";

/** Индикатор загрузки без текста: работает и до загрузки словаря. */
export const Spinner = ({ className }: { className?: string }) => (
  <span
    aria-busy="true"
    className={cn("inline-block size-8 animate-spin rounded-full border-2 border-line border-t-accent", className)}
  />
);

/** Спиннер по центру экрана. */
export const FullScreenSpinner = () => (
  <div className="grid min-h-full place-items-center p-4">
    <Spinner />
  </div>
);
