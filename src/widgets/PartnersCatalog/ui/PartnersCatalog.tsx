import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PARTNER_TYPES, PartnerCard, PartnerDetails, type PartnerType } from "@/entities/Partner";
import { useT, type TranslationKey } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { Button, Spinner } from "@/shared/ui";
import { usePartners } from "../model/usePartners";

type Filter = "all" | PartnerType;
const FILTER_LABEL: Record<Filter, TranslationKey> = {
  all: "partners.filterAll",
  GOV: "partners.filterGOV",
  CARRIER: "partners.filterCARRIER",
  PRIVATE: "partners.filterPRIVATE",
};

/**
 * Список партнёров; открытый партнёр (/partners/<id>) занимает всю область
 * страницы под шапкой — меню остаётся на месте. «Назад» на телефоне и Esc
 * возвращают к списку, фильтр сохраняется (тот же компонент, см. Router).
 */
export const PartnersCatalog = () => {
  const t = useT();
  const { items, error, loading, retry } = usePartners();
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? items : items.filter((p) => p.type === filter);

  const { partnerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const opened = partnerId ? items.find((p) => p.id === partnerId) : undefined;

  const closeDetails = () => {
    // пришли кликом из списка — шаг назад; по прямой ссылке — на список, не уходя с сайта
    if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1);
    else navigate("/partners", { replace: true });
  };

  // открыли — к началу страницы и фокус на название (скринридер прочитает, где мы);
  // закрыли — фокус обратно на карточку этого партнёра
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastOpenedId = useRef<string | null>(null);
  useEffect(() => {
    if (opened) {
      lastOpenedId.current = opened.id;
      window.scrollTo(0, 0);
      titleRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDetails();
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    if (lastOpenedId.current) {
      document.querySelector<HTMLElement>(`[data-partner-id="${lastOpenedId.current}"]`)?.focus();
      lastOpenedId.current = null;
    }
    // closeDetails меняется на каждой отрисовке; подписка нужна только на смену партнёра
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened?.id]);

  // ссылка на скрытого или удалённого партнёра — просто список
  useEffect(() => {
    if (partnerId && !loading && !error && !opened) navigate("/partners", { replace: true });
  }, [partnerId, loading, error, opened, navigate]);

  if (opened) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={closeDetails} className="-ml-3">
          ← {t("partners.backToList")}
        </Button>
        <PartnerDetails partner={opened} titleRef={titleRef} />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div role="group" aria-label={t("partners.filterLabel")} className="flex flex-wrap gap-2">
        {(["all", ...PARTNER_TYPES] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "min-h-11 rounded-full border border-line px-4 text-sm",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
              filter === value ? "border-accent bg-accent text-on-accent" : "bg-card hover:bg-accent-soft"
            )}
          >
            {t(FILTER_LABEL[value])}
          </button>
        ))}
      </div>

      {loading && items.length === 0 ? (
        <div className="py-8 text-center">
          <Spinner />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-danger">
          {error}
          <Button variant="ghost" onClick={retry}>
            {t("common.retry")}
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded border border-line bg-card p-5 text-muted">{t("partners.empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((partner) => (
            <li key={partner.id}>
              <Link
                to={`/partners/${partner.id}`}
                state={{ fromList: true }}
                // имя ссылки: внутри <article>, из содержимого браузер его не собирает
                aria-label={partner.name}
                data-partner-id={partner.id}
                className="block h-full rounded transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <PartnerCard partner={partner} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
