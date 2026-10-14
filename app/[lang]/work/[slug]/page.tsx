import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Cursor from "@/components/Cursor";
import GrainOverlay from "@/components/GrainOverlay";
import Footer from "@/components/Footer";
import Testimonial from "@/components/Testimonial";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { fill, hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { caseStudySlugs, getProject, getProjects } from "@/lib/projects";
import { whatsappUrl } from "@/lib/site";

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
  const title = `${project.title} — ${getDictionary(lang).caseStudy.eyebrow} · Abdellah Kachani`;

  return {
    title,
    description: project.subtitle,
    alternates: {
      canonical: `/${lang}/work/${slug}`,
      languages: { fr: `/fr/work/${slug}`, en: `/en/work/${slug}`, "x-default": `/fr/work/${slug}` },
    },
    openGraph: {
      title,
      description: project.subtitle,
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
    <>
      <Cursor />
      <GrainOverlay />

      <main className="relative min-h-screen" style={{ background: brand.background, color: brand.ink }}>
        <header className="flex items-center justify-between px-6 pt-8 sm:px-12">
          <a
            href={`/${lang}#work`}
            className="label-caps inline-flex min-h-10 items-center gap-2 text-white/70 transition-colors hover:text-white"
          >
            <span aria-hidden="true">←</span> {t.back}
          </a>
          <a
            href={`/${lang === "fr" ? "en" : "fr"}/work/${slug}`}
            hrefLang={lang === "fr" ? "en" : "fr"}
            aria-label={dict.nav.switchLabel}
            className="label-caps rounded-full border border-white/20 px-3 py-2 text-white transition-colors hover:border-white/60"
          >
            {lang === "fr" ? "EN" : "FR"}
          </a>
        </header>

        <section className="px-6 pb-16 pt-16 sm:px-12 sm:pt-24">
          <p className="label-caps" style={{ color: brand.accent }}>
            {t.eyebrow} · {project.status}
          </p>
          <h1 className="display mt-6 text-[clamp(3rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.025em]">
            {project.title}
          </h1>
          <p className="serif mt-5 text-2xl italic sm:text-3xl" style={{ color: brand.accent }}>
            {project.meaning}
          </p>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75">{project.subtitle}</p>

          <dl className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="label-caps text-white/55">{fact.label}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/85">{fact.value}</dd>
              </div>
            ))}
            {project.href && (
              <div>
                <dt className="label-caps text-white/55">{t.live}</dt>
                <dd className="mt-2 text-sm">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline-offset-4 hover:underline"
                    style={{ color: brand.accent }}
                  >
                    {t.visit} {new URL(project.href).hostname} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {project.preview && (
          <div className="px-4 sm:px-12">
            <Image
              src={project.preview.src}
              width={project.preview.width}
              height={project.preview.height}
              alt={project.preview.alt}
              priority
              sizes="(min-width: 640px) calc(100vw - 6rem), calc(100vw - 2rem)"
              className="h-auto w-full rounded-2xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:rounded-3xl"
            />
          </div>
        )}

        <section className="grid gap-14 px-6 py-24 sm:px-12 lg:grid-cols-3 lg:gap-10">
          {sections.map((section, i) => (
            <div key={section.title}>
              <span className="serif text-xl italic" style={{ color: brand.accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="display mt-4 text-3xl tracking-tight">{section.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">{section.body}</p>
            </div>
          ))}
        </section>

        <section className="px-6 pb-24 sm:px-12">
          <h2 className="label-caps" style={{ color: brand.accent }}>
            {t.results}
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {study.results.map((result) => (
              <div key={result.label} className="bg-black/40 p-7">
                <p className="display text-5xl tracking-tight">{result.value}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{result.label}</p>
              </div>
            ))}
          </div>
        </section>

        {project.id === "yalla" && <Testimonial t={dict.testimonial} />}

        <section className="px-6 pb-24 sm:px-12">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 sm:p-12">
            <h2 className="display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">{t.similarTitle}</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{t.similarText}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl(fill(t.similarMessage, { title: project.title }))}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp_click"
                data-track-label={`case-${slug}`}
                className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon />
                {t.similarCta}
              </a>
              {next && next.slug !== slug && (
                <a
                  href={`/${lang}/work/${next.slug}`}
                  className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                >
                  {t.next} {next.title} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="bg-[var(--bg)]">
        <Footer />
      </div>
    </>
  );
}
