import { useT } from "@/shared/i18n";
import { Button, Spinner } from "@/shared/ui";
import { useAbout } from "../model/useAbout";

export const AboutContent = () => {
  const t = useT();
  const { about, error, loading, retry } = useAbout();

  if (loading && !about) {
    return (
      <div className="py-8 text-center">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 text-danger">
        {error}
        <Button variant="ghost" onClick={retry}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }
  // админ ещё не заполнил страницу
  if (!about) {
    return (
      <div className="space-y-2">
        <p className="max-w-2xl text-muted">{t("pages.aboutLead")}</p>
        <p className="text-muted">{t("common.comingSoon")}</p>
      </div>
    );
  }

  const { intro, stats, activities, contacts } = about;
  const contactRows = [
    { label: t("about.address"), value: contacts.address },
    { label: t("about.phone"), value: contacts.phone, href: contacts.phone && `tel:${contacts.phone.replace(/[^+\d]/g, "")}` },
    { label: t("about.email"), value: contacts.email, href: contacts.email && `mailto:${contacts.email}` },
    { label: t("about.hours"), value: contacts.hours },
  ].filter((row) => row.value);

  return (
    <div className="space-y-8">
      <p className="max-w-2xl whitespace-pre-line text-lg">{intro}</p>

      {stats.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <li key={i} className="rounded border border-line bg-card p-5">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </li>
          ))}
        </ul>
      )}

      {activities.length > 0 && (
        <section className="rounded border border-line bg-card p-5">
          <h2 className="mb-3 text-xl font-semibold">{t("about.whatWeDo")}</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            {activities.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {contactRows.length > 0 && (
        <section className="rounded border border-line bg-card p-5">
          <h2 className="mb-3 text-xl font-semibold">{t("about.contacts")}</h2>
          <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
            {contactRows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="whitespace-pre-line">
                  {row.href ? (
                    <a href={row.href} className="text-accent underline-offset-2 hover:underline">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};
