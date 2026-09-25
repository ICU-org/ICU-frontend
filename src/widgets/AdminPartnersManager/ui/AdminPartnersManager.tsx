import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DeletePartnerButton } from "@/features/DeletePartner";
import { PartnerForm, partnerDraftKey } from "@/features/EditPartner";
import { useAdminSession } from "@/entities/AdminSession";
import { PartnerLogoUpload } from "@/features/PartnerLogoUpload";
import { PartnerLogo, TYPE_LABEL, partnerDisplayName, type AdminPartner } from "@/entities/Partner";
import { useLocale, useT } from "@/shared/i18n";
import { clearDraft, listDrafts } from "@/shared/lib";
import { Button, ButtonLink, Spinner } from "@/shared/ui";
import { useAdminPartners } from "../model/useAdminPartners";

/** Имя сохранённого на странице создания приходит в state перехода. */
type LocationState = { savedName?: string } | null;

export const AdminPartnersManager = () => {
  const t = useT();
  const { defaultLocale, locale } = useLocale();
  const { items, error, loading, reload } = useAdminPartners();
  const location = useLocation();
  const navigate = useNavigate();
  /** id партнёра, открытого на изменение. */
  // вернулись после истёкшей сессии — сразу открыть партнёра с несохранённым черновиком
  const adminId = useAdminSession((s) => s.admin?.id);
  /** undefined — ещё не выбирали: тогда открыт партнёр с черновиком (вернулись после истёкшей сессии). */
  const [chosen, setChosen] = useState<string | null | undefined>(undefined);
  const [draftPartnerId] = useState(() => listDrafts("partner:", adminId).find((id) => id !== "new") ?? null);
  const editing =
    chosen !== undefined ? chosen : draftPartnerId && items.some((p) => p.id === draftPartnerId) ? draftPartnerId : null;

  // черновики партнёров, которых больше нет (удалили), — мусор
  useEffect(() => {
    if (loading || error) return;
    for (const id of listDrafts("partner:", adminId)) {
      if (id !== "new" && !items.some((p) => p.id === id)) clearDraft(partnerDraftKey(id));
    }
  }, [items, loading, error, adminId]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  /** Строка исчезла вместе с нажатой кнопкой — фокус на заголовок, а не в начало страницы. */
  const onDeleted = () => {
    reload();
    titleRef.current?.focus();
  };
  /** Имя последнего сохранённого — для «Сохранено: …»; сбрасывается при следующем действии. */
  const [savedName, setSavedName] = useState<string | null>(() => (location.state as LocationState)?.savedName ?? null);

  // сообщение показано — убрать из истории, чтобы не всплыло после перезагрузки
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const nameOf = (p: AdminPartner) => partnerDisplayName(p, locale, defaultLocale);

  const openEditor = (id: string | null) => {
    setSavedName(null);
    // закрыли открытую форму «Изменить» — это отказ от правок, черновик тоже
    if (editing && editing !== id) clearDraft(partnerDraftKey(editing));
    setChosen(id);
  };

  // после сохранения форма закрывается; снова открыть — «Изменить» (там же логотип)
  const onSaved = (saved: AdminPartner) => {
    reload();
    setChosen(null);
    setSavedName(nameOf(saved));
  };

  return (
    <section aria-labelledby="partners-admin-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="partners-admin-title" ref={titleRef} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
            {t("admin.partnersTitle")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t("admin.partnersHint")}</p>
        </div>
        <ButtonLink to="/admin/partners/new">{t("admin.addPartner")}</ButtonLink>
      </div>

      {savedName && (
        <p role="status" className="text-sm text-ok">
          {t("admin.partnerSaved", { name: savedName })}
        </p>
      )}

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
          {error}
          <Button variant="ghost" onClick={reload}>
            {t("common.retry")}
          </Button>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="py-8 text-center">
          <Spinner />
        </div>
      ) : items.length === 0 && !error ? (
        <p className="rounded border border-line bg-card p-5 text-muted">{t("admin.noPartners")}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((partner) => (
            <li key={partner.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 rounded border border-line bg-card p-4">
                <PartnerLogo name={nameOf(partner)} logoUrl={partner.logoUrl} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {nameOf(partner)}
                    {!partner.isVisible && (
                      <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs text-muted">{t("admin.hiddenBadge")}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted">{t(TYPE_LABEL[partner.type])}</p>
                </div>
                <div className="flex items-start gap-1">
                  <Button
                    variant="ghost"
                    aria-expanded={editing === partner.id}
                    onClick={() => openEditor(editing === partner.id ? null : partner.id)}
                  >
                    {t("admin.editPartner")}
                  </Button>
                  <DeletePartnerButton id={partner.id} onDeleted={onDeleted} />
                </div>
              </div>
              {editing === partner.id && (
                <div className="space-y-3 border-l-2 border-accent pl-3">
                  {/* без key по updatedAt: загрузка логотипа обновляет список, но не должна стирать несохранённые правки */}
                  <PartnerForm partner={partner} onSaved={onSaved} onCancel={() => setChosen(null)} />
                  <PartnerLogoUpload partner={partner} onChanged={reload} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
