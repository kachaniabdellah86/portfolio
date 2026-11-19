import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GrainOverlay from "@/components/GrainOverlay";
import Footer from "@/components/Footer";
import Process from "@/components/Process";
import Rich from "@/components/Rich";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Reveal } from "@/components/Marquee";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { whatsappUrl } from "@/lib/site";

// The page cold emails to studios and agencies point to: white-label, terms, proof.
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

const SIGNAL = "linear-gradient(90deg, #5b8fff, #9d7bff 55%, #ffb36b)";

export default async function StudiosPage({ params }: PageProps<"/[lang]/studios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.studios;
  const otherLang = lang === "fr" ? "en" : "fr";

  return (
    <>
      <GrainOverlay />

      <main id="main" tabIndex={-1} className="relative min-h-screen bg-[var(--bg)]">
        <header className="flex items-center justify-between px-6 pt-8 sm:px-12">
          <nav aria-label={dict.caseStudy.breadcrumbLabel}>
            <ol className="label-caps flex min-h-10 items-center gap-x-2 text-white/70">
              <li>
                <a href={`/${lang}`} className="transition-colors hover:text-white">
                  <span aria-hidden="true">← </span>
                  {dict.caseStudy.breadcrumbHome}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {t.breadcrumb}
              </li>
            </ol>
          </nav>
          <a
            href={`/${otherLang}/studios`}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={dict.nav.switchLabel}
            className="label-caps rounded-full border border-white/20 px-3 py-2 text-white transition-colors hover:border-white/60"
          >
            {otherLang.toUpperCase()}
          </a>
        </header>

        {/* Hero */}
        <section className="relative px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-28">
          <p className="label-caps accent">{t.eyebrow}</p>
          <h1 className="display mt-6 max-w-5xl text-[clamp(2.9rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.025em]">
            <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75">{t.intro}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={whatsappUrl(t.ctaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp_click"
              data-track-label="studios-hero"
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon />
              {t.ctaPrimary}
            </a>
            <a
              href={`/${lang}#work`}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white"
            >
              {t.ctaSecondary} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <span aria-hidden="true" className="absolute inset-x-6 bottom-0 h-px opacity-60 sm:inset-x-12" style={{ background: SIGNAL }} />
        </section>

        {/* What you can hand me: a spec ladder, one row per kind of job. */}
        <section className="px-6 py-24 sm:px-12 sm:py-32">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="label-caps accent">{t.handLabel}</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="display mt-5 text-[clamp(2.4rem,6vw,5.6rem)] leading-[1.0]">
                  <Rich text={t.handHeading} emClassName="serif accent text-[1.06em] italic" />
                </h2>
              </Reveal>
            </div>
          </div>
          <ol className="mt-14 border-b border-[var(--hairline)] sm:mt-20">
            {t.hand.map((item, i) => (
              <li key={item.title}>
                <Reveal delay={i * 0.04}>
                  <div className="group relative grid gap-3 border-t border-[var(--hairline)] py-8 sm:py-10 lg:grid-cols-12 lg:items-baseline lg:gap-8">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
                      style={{ background: SIGNAL }}
                    />
                    <span aria-hidden="true" className="font-mono text-sm text-white/45 lg:col-span-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="display text-2xl tracking-tight sm:text-3xl lg:col-span-5">{item.title}</h3>
                    <p className="max-w-xl text-base leading-relaxed text-white/70 lg:col-span-6">{item.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <Process t={t.process} />

        {/* Terms, set like the clauses of a short contract. */}
        <section className="px-6 py-24 sm:px-12 sm:py-32">
          <Reveal>
            <p className="label-caps accent">{t.termsLabel}</p>
          </Reveal>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {t.terms.map((term, i) => (
              <div key={term.k} className="bg-[var(--bg)] p-7 sm:p-8">
                <dt className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/55">
                  §{i + 1} · {term.k}
                </dt>
                <dd className="mt-3 text-base leading-relaxed text-white/85">{term.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Proof */}
        <section className="px-6 pb-24 sm:px-12 sm:pb-32">
          <Reveal>
            <p className="label-caps accent">{t.proofLabel}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,5.6rem)] leading-[1.0]">
              <Rich text={t.proofHeading} emClassName="serif accent text-[1.06em] italic" />
            </h2>
          </Reveal>
          <ul className="mt-14 grid gap-6 lg:grid-cols-3">
            {t.proof.map((item) => (
              <li key={item.title}>
                <a
                  href={item.href}
                  className="group flex h-full flex-col rounded-3xl border border-white/10 p-7 transition-colors hover:border-[var(--accent)] sm:p-8"
                >
                  <h3 className="display text-2xl tracking-tight">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">{item.text}</p>
                  <span className="label-caps accent mt-6">
                    {t.open} <span aria-hidden="true">→</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div className="bg-[var(--bg)]">
        <Footer />
      </div>
    </>
  );
}
