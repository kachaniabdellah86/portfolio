import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/agadir/Header";
import Testimonial from "@/components/Testimonial";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { fill, hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { caseStudySlugs, getProject, getProjects } from "@/lib/projects";
import { whatsappUrl } from "@/lib/site";
import { caseStudyGraph, jsonLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => caseStudySlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const project = getProject(lang, slug);
  if (!project) return {};
  const title = `${project.title}, ${getDictionary(lang).caseStudy.eyebrow.toLowerCase()} | Abdellah Kachani`;

  return {
    title,
    description: project.seoDescription,
    alternates: {
      canonical: `/${lang}/work/${slug}`,
      languages: { fr: `/fr/work/${slug}`, en: `/en/work/${slug}`, "x-default": `/fr/work/${slug}` },
    },
    openGraph: {
      title,
      description: project.seoDescription,
      type: "article",
      url: `/${lang}/work/${slug}`,
      images: project.preview ? [{ url: project.preview.src, alt: project.preview.alt }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const project = getProject(lang, slug);
  if (!project?.study) notFound();

  const dict = getDictionary(lang);
  const t = dict.caseStudy;
  const { brand, study } = project;
  const studies = getProjects(lang).filter((p) => p.slug && p.study);
  const next = studies[(studies.findIndex((p) => p.slug === slug) + 1) % studies.length];

  const facts = [
    { label: t.role, value: project.details.role },
    { label: t.stack, value: project.details.stack.join(" · ") },
    { label: t.year, value: project.year },
  ];

  const sections = [
    { title: t.context, body: study.context },
    { title: t.problem, body: project.details.problem },
    { title: t.built, body: project.details.built },
  ];

  return (
    <div className="ag g-case" style={{ ["--brand" as string]: brand.accent }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(caseStudyGraph(lang, project))} />
      <Header />

      {/* Opens on the dark inside of the cell, where the wall's door transition lands. */}
      <main id="main" tabIndex={-1}>
        <section className="g-case__hero g-wrap">
          <nav aria-label={t.breadcrumbLabel} className="g-case__crumbs">
            <a href={`/${lang}`} className="g-draw">{t.breadcrumbHome}</a>
            <span aria-hidden="true">/</span>
            <a href={`/${lang}#work`} className="g-draw">{t.breadcrumbWork}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.title}</span>
          </nav>
          <p className="g-case__status">{project.status}</p>
          <h1 className="g-case__title" data-split="lines" data-intro>{project.title}</h1>
          <p className="g-case__meaning" data-split="lines" data-intro data-delay="0.15">{project.meaning}</p>
          <div className="k-anchor-row" aria-hidden="true">
            <span className="k-anchor k-anchor--case" data-robot-anchor="wave" data-robot-thin data-robot-say={dict.robot.caseTop} />
          </div>
          <dl className="g-case__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
            {project.href && (
              <div>
                <dt>{t.live}</dt>
                <dd>
                  <a href={project.href} target="_blank" rel="noopener noreferrer" className="g-link">
                    {new URL(project.href).hostname} <span aria-hidden="true">↗</span>
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {project.preview && (
          <figure className="g-case__media g-wrap" data-reveal="bolt" data-intro data-delay="0.25">
            <Image
              src={project.preview.src}
              width={project.preview.width}
              height={project.preview.height}
              alt={project.preview.alt}
              loading="eager"
              fetchPriority="high"
              sizes="calc(100vw - 5rem)"
            />
          </figure>
        )}

        <section className="g-case__story g-wrap g-grid">
          <p className="g-case__lead">{project.subtitle}</p>
          {sections.map((section) => (
            <div key={section.title} className="g-case__block">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </section>

        <section className="g-case__results g-wrap" aria-labelledby="results-title">
          <h2 id="results-title" className="g-case__label">{t.results}</h2>
          <dl>
            {study.results.map((result) => (
              <div key={result.label}>
                <dt className="num">{result.value}</dt>
                <dd>{result.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {project.id === "yalla" && <Testimonial t={dict.testimonial} />}

        <section className="g-case__next g-wrap">
          <span className="k-anchor k-anchor--next" data-robot-anchor="stand" data-robot-thin data-robot-say={dict.robot.caseNext} aria-hidden="true" />
          <div>
            <h2 className="g-title">{t.similarTitle}</h2>
            <p>{t.similarText}</p>
            <a
              href={whatsappUrl(fill(t.similarMessage, { title: project.title }))}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp_click"
              data-track-label={`case-${slug}`}
              className="g-btn"
              data-fill
            >
              <span className="g-btn__fill" aria-hidden="true" />
              <WhatsAppIcon />
              {t.similarCta}
            </a>
          </div>
          {next && next.slug !== slug && (
            <a href={`/${lang}/work/${next.slug}`} className="g-case__nextlink">
              <span>{t.next}</span>
              <strong>{next.title}</strong>
            </a>
          )}
        </section>
      </main>
    </div>
  );
}
