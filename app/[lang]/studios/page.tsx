import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/agadir/Header";
import SmallFooter from "@/components/kachani/SmallFooter";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { whatsappUrl } from "@/lib/site";

// The page cold emails to studios and agencies point to: white-label, terms, proof.
// Same indigo system as the home page (DESIGN.md).
export async function generateMetadata({ params }: PageProps<"/[lang]/studios">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).studios;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/studios`,
      languages: { fr: "/fr/studios", en: "/en/studios", "x-default": "/en/studios" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website", url: `/${lang}/studios`, images: [`/${lang}/opengraph-image`] },
  };
}

// Display titles in the dictionary carry *emphasis* marks for the old serif design; the
// poster face sets them plain.
const plain = (s: string) => s.replace(/[~*]/g, "").replace(/\n/g, " ");

export default async function StudiosPage({ params }: PageProps<"/[lang]/studios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.studios;

  return (
    <div className="ag" data-grounds>
      <Header />

      <main id="main" tabIndex={-1}>
        <section className="k-page g-wrap" data-ground="field" aria-labelledby="studios-title">
          <nav aria-label={dict.caseStudy.breadcrumbLabel} className="g-case__crumbs">
            <a href={`/${lang}`} className="g-draw">{dict.caseStudy.breadcrumbHome}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t.breadcrumb}</span>
          </nav>
          <p className="k-page__eyebrow g-mono">{t.eyebrow}</p>
          <h1 id="studios-title" className="k-page__title k-page__title--long" data-split="lines" data-intro>{t.title}</h1>
          <p className="k-page__lead" data-split="lines" data-intro data-delay="0.15">{t.intro}</p>
          <div className="k-hero__cta" data-reveal="fade" data-intro data-delay="0.3">
            <a href={whatsappUrl(t.ctaMessage)} target="_blank" rel="noopener noreferrer" className="g-btn" data-fill data-track="whatsapp_click" data-track-label="studios-hero" data-robot-react={dict.robot.hoverCta}>
              <span className="g-btn__fill" aria-hidden="true" />
              <WhatsAppIcon />
              {t.ctaPrimary}
            </a>
            <a href={`/${lang}#work`} className="g-btn g-btn--ghost" data-fill>
              <span className="g-btn__fill" aria-hidden="true" />
              {t.ctaSecondary} <span className="g-arrow" aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section className="k-offers g-wrap" data-ground="night" aria-labelledby="hand-title">
          <div className="k-head">
            <h2 id="hand-title" className="g-title" data-split="lines">{plain(t.handHeading)}</h2>
            <p>{t.handLabel}</p>
          </div>
          <ul className="k-rows k-rows--plain">
            {t.hand.map((item) => (
              <li key={item.title} className="k-row">
                <h3 className="k-row__name">{item.title}</h3>
                <p className="k-row__pitch">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="k-process g-wrap" data-ground="field" aria-labelledby="studio-process-title">
          <div className="k-head">
            <h2 id="studio-process-title" className="g-title" data-split="lines">{plain(t.process.heading)}</h2>
            <p>{t.process.intro}</p>
          </div>
          <ol className="k-steps">
            {t.process.steps.map((step, i) => (
              <li key={step.title} className="k-step">
                <span className="k-step__n num" aria-hidden="true">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="k-step__time g-meta">{step.time}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="k-terms g-wrap" data-ground="night" aria-labelledby="terms-title">
          <div className="k-head">
            <h2 id="terms-title" className="g-title" data-split="lines">{t.termsLabel}</h2>
          </div>
          <dl className="k-facts k-facts--terms">
            {t.terms.map((term) => (
              <div key={term.k}>
                <dt>{term.k}</dt>
                <dd>{term.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="k-proof g-wrap" data-ground="night" aria-labelledby="proof-title">
          <div className="k-head">
            <h2 id="proof-title" className="g-title" data-split="lines">{plain(t.proofHeading)}</h2>
            <p>{t.proofLabel}</p>
          </div>
          <ul className="k-proof__list">
            {t.proof.map((item) => (
              <li key={item.title}>
                <a href={item.href} className="k-lab">
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  <span className="g-btn g-btn--ghost" data-fill>
                    <span className="g-btn__fill" aria-hidden="true" />
                    {t.open} <span className="g-arrow" aria-hidden="true">→</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="k-close g-wrap" data-ground="field">
        <div>
          <h2 className="g-title" data-split="lines">{t.closeTitle}</h2>
          <p>{t.closeText}</p>
          <a href={whatsappUrl(t.ctaMessage)} target="_blank" rel="noopener noreferrer" className="g-btn" data-fill data-track="whatsapp_click" data-track-label="studios-close">
            <span className="g-btn__fill" aria-hidden="true" />
            <WhatsAppIcon />
            {t.ctaPrimary}
          </a>
        </div>
        <SmallFooter lang={lang} />
      </footer>
    </div>
  );
}
