import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/agadir/Header";
import { LabExperiments } from "@/components/Gallery";
import { Showcase } from "@/components/WorkSection";
import SmallFooter from "@/components/kachani/SmallFooter";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getProjects } from "@/lib/projects";
import { whatsappUrl } from "@/lib/site";

// Self-initiated concepts and interaction experiments, in the same indigo system as the home
// page (DESIGN.md): client work and offers stay first on the home page, craft lives here.
export async function generateMetadata({ params }: PageProps<"/[lang]/lab">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).labPage;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/lab`,
      languages: { fr: "/fr/lab", en: "/en/lab", "x-default": "/en/lab" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website", url: `/${lang}/lab`, images: [`/${lang}/opengraph-image`] },
  };
}

export default async function LabPage({ params }: PageProps<"/[lang]/lab">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.labPage;
  const concepts = getProjects(lang).filter((project) => !project.slug);

  return (
    <div className="ag" data-grounds>
      <Header />

      <main id="main" tabIndex={-1}>
        <section className="k-page g-wrap" data-ground="field" aria-labelledby="lab-title">
          <nav aria-label={dict.caseStudy.breadcrumbLabel} className="g-case__crumbs">
            <a href={`/${lang}`} className="g-draw">{dict.caseStudy.breadcrumbHome}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t.breadcrumb}</span>
          </nav>
          <h1 id="lab-title" className="k-page__title" data-split="lines" data-intro>{t.title}</h1>
          <p className="k-page__lead" data-split="lines" data-intro data-delay="0.15">{t.intro}</p>
        </section>

        <section className="k-concepts g-wrap" data-ground="night" aria-labelledby="concepts-title">
          <div className="k-head">
            <h2 id="concepts-title" className="g-title" data-split="lines">{t.label}</h2>
            <p>{t.conceptsNote}</p>
          </div>
          {concepts.map((p) => (
            <article key={p.id} className="k-concept g-grid">
              <div className="k-concept__label">
                <h3>{p.title}</h3>
                <p className="g-mono">
                  {p.year} · {p.status}
                </p>
              </div>
              <div className="k-concept__stage" style={{ background: p.brand.background, color: p.brand.ink }}>
                <Showcase project={p} />
              </div>
              <div className="k-concept__body">
                <p className="k-concept__lead">{p.subtitle}</p>
                <p>{p.details.built}</p>
                <p className="g-mono">{p.details.stack.join(" · ")}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="k-lab-exps g-wrap" data-ground="night" aria-labelledby="exps-title">
          <div className="k-head">
            <h2 id="exps-title" className="g-title" data-split="lines">{dict.lab.label}</h2>
            <p>{dict.lab.intro}</p>
          </div>
          <LabExperiments />
        </section>
      </main>

      <footer className="k-close g-wrap" data-ground="field">
        <div>
          <h2 className="g-title" data-split="lines">{t.closeTitle}</h2>
          <p>{t.closeText}</p>
          <a href={whatsappUrl(t.closeMessage)} target="_blank" rel="noopener noreferrer" className="g-btn" data-fill data-track="whatsapp_click" data-track-label="lab-close">
            <span className="g-btn__fill" aria-hidden="true" />
            <WhatsAppIcon />
            {t.closeCta}
          </a>
        </div>
        <SmallFooter lang={lang} />
      </footer>
    </div>
  );
}
