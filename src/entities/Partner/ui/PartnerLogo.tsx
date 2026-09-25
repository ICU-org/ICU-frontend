import { assetUrl, cn } from "@/shared/lib";

/** Логотип; нет — инициалы. Декоративный: название партнёра — рядом текстом. */
export const PartnerLogo = ({ name, logoUrl, className }: { name: string; logoUrl: string | null; className?: string }) => {
  const box = cn("grid size-12 shrink-0 place-items-center overflow-hidden rounded bg-accent-soft", className);
  if (logoUrl) {
    return (
      <span className={box}>
        <img src={assetUrl(logoUrl)} alt="" className="size-full object-contain" loading="lazy" />
      </span>
    );
  }
  // первые буквы первых двух слов; кавычки и знаки («…», "…") не считаются
  const initials = name
    .split(/\s+/)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span aria-hidden className={cn(box, "text-sm font-semibold text-accent")}>
      {initials}
    </span>
  );
};
