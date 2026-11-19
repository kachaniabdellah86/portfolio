import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/agadir/Header";
import Clock from "@/components/agadir/Clock";
import Brief from "@/components/agadir/Brief";
import HeatWord from "@/components/kachani/HeatWord";
import BendScreens from "@/components/kachani/BendScreens";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { fill, hasLocale } from "@/lib/i18n";
import { bookingMonth, getDictionary } from "@/lib/dictionaries";
import { getProjects } from "@/lib/projects";
import { whatsappUrl } from "@/lib/site";
import { homeGraph, jsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).home;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    openGraph: { title: t.metaTitle, description: t.metaDescription },
    twitter: { title: t.metaTitle, description: t.metaDescription },
  };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.home;
  const work = getProjects(lang).filter((p) => p.slug);
  const month = bookingMonth(lang);

  return (
    <div className="ag" data-grounds>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(homeGraph(lang))} />
      <Header />
      <BendScreens />

      <main id="main" tabIndex={-1}>
        {/* ── The name in the heat ───────────────────────────────── */}
        <section className="k-hero" data-ground="field" aria-labelledby="hero-title">
          <HeatWord>
            <h1 id="hero-title">
              <span className="k-word__text" data-heat-text>
                Kachani
              </span>
              <span className="sr-only">Abdellah Kachani, {t.hero.role}</span>
            </h1>
          </HeatWord>
          <div className="k-hero__base">
            <div style={{ gridColumn: "1 / span 7" }}>
              <p className="k-hero__line" data-split="lines" data-intro data-delay="0.3">
                {t.hero.line}
              </p>
              <div className="k-hero__cta" data-reveal="fade" data-intro data-delay="0.5">
                <a href={whatsappUrl(dict.journey.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="g-btn" data-fill data-track="whatsapp_click" data-track-label="hero" data-robot-react={dict.robot.hoverCta}>
                  <span className="g-btn__fill" aria-hidden="true" />
                  <WhatsAppIcon />
                  {dict.journey.ctaPrimary}
                </a>
                <a href="#work" className="g-btn g-btn--ghost" data-fill>
                  <span className="g-btn__fill" aria-hidden="true" />
                  {dict.journey.ctaSecondary} <span className="g-arrow" aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
            <p className="k-hero__meta g-mono" data-reveal="fade" data-intro data-delay="0.55">
              <span>
                <Clock label={t.hero.clockLabel} /> GMT+1 · {t.hero.place}
              </span>
              <span>
                <span className="k-dot" aria-hidden="true" />
                {t.hero.available}, {month}
              </span>
              <span className="g-tifinagh" lang="zgh" aria-label={t.hero.glyphReading}>
                ⴰⴳⴰⴷⵉⵔ
              </span>
            </p>
          </div>
        </section>

        {/* ── Statement ────────────────────────────────────────── */}
        <section className="k-statement g-wrap g-grid" data-ground="field" aria-label="Agadir">
          <p data-scrub-words>{t.statement}</p>
          <span className="k-anchor k-anchor--statement" data-robot-anchor="stand" data-robot-say={dict.robot.statement} aria-hidden="true" />
        </section>

        {/* ── Work ─────────────────────────────────────────────── */}
        <section id="work" className="k-work g-wrap" data-ground="night" aria-labelledby="work-title">
          <div className="k-head">
            <h2 id="work-title" className="g-title" data-split="lines">{t.work.title}</h2>
            <p>{t.work.note}</p>
          </div>
          {work.map((p, i) => (
            <article key={p.id} className={`k-project g-grid ${i % 2 ? "k-project--flip" : ""}`}>
              <div className="k-project__label">
                <h3>{p.title}</h3>
                <p className="g-mono">
                  {p.year} · {p.status}
                </p>
              </div>
              {p.preview && (
                <a href={`/${lang}/work/${p.slug}`} className="k-project__screen" data-bend data-robot-react={dict.robot.hoverScreen} aria-label={`${t.work.read}: ${p.title}`}>
                  <Image src={p.preview.src} alt={p.preview.alt} width={p.preview.width} height={p.preview.height} sizes="(min-width: 768px) 72vw, 100vw" />
                  <span className="k-anchor k-anchor--screen" data-robot-anchor="stand" data-robot-say={i === 0 ? dict.robot.work1 : dict.robot.work2} aria-hidden="true" />
                  <span className="k-open" aria-hidden="true">
                    {t.hero.open} →
                  </span>
                </a>
              )}
              <div className="k-project__body">
                <p>{p.subtitle}</p>
                {p.study && (
                  <dl className="k-results">
                    {p.study.results.slice(0, 2).map((r) => (
                      <div key={r.label}>
                        <dt className="num">{r.value}</dt>
                        <dd>{r.label}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="k-links">
                  <a href={`/${lang}/work/${p.slug}`} className="g-link">{t.work.read}</a>
                  {p.href && (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="g-link">
                      {t.work.visit} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </p>
              </div>
            </article>
          ))}
          <a href={`/${lang}/lab`} className="k-lab" data-robot-react={dict.robot.hoverLab}>
            <strong>{t.hero.labTitle}</strong>
            <p>{dict.work.labTeaser.text}</p>
            <span className="g-btn g-btn--ghost" data-fill>
              <span className="g-btn__fill" aria-hidden="true" />
              {dict.work.labTeaser.cta} <span className="g-arrow" aria-hidden="true">→</span>
            </span>
          </a>
        </section>

        {/* ── Offers ───────────────────────────────────────────── */}
        <section id="offers" className="k-offers g-wrap" data-ground="field" aria-labelledby="offers-title">
          <div className="k-head">
            <h2 id="offers-title" className="g-title" data-split="lines">{t.register.title}</h2>
            <p>{t.register.note}</p>
          </div>
          <span className="k-anchor k-anchor--offers" data-robot-anchor="stand" data-robot-say={dict.robot.offers} aria-hidden="true" />
          <ul className="k-rows">
            {dict.services.packages.map((pkg) => (
              <li key={pkg.name} className="k-row" data-robot-react={dict.robot.hoverOffer}>
                <h3 className="k-row__name">{pkg.name}</h3>
                <div className="k-row__pitch">
                  <p>{pkg.pitch}</p>
                  <ul>
                    {pkg.features.slice(0, 3).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <p className="k-row__price num">
                  <small>{t.register.from}</small>
                  <strong>{lang === "fr" ? `${pkg.amount} ${pkg.currency}` : `${pkg.currency}${pkg.amount}`}</strong>
                </p>
                <a className="k-row__ask" href={whatsappUrl(fill(dict.services.ctaMessage, { name: pkg.name }))} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" data-track-label={`offer-${pkg.name}`}>
                  {t.register.ask} <span className="g-arrow" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="k-offers__foot">
            <a href={`/${lang}/studios`} className="g-link">{t.register.studios}</a>
          </p>
        </section>

        {/* ── Process ──────────────────────────────────────────── */}
        <section className="k-process g-wrap" data-ground="night" aria-labelledby="process-title">
          <div className="k-head">
            <h2 id="process-title" className="g-title" data-split="lines">{t.process.title}</h2>
            <p>{dict.process.intro}</p>
          </div>
          <ol className="k-steps">
            {dict.process.steps.map((step, i) => (
              <li key={step.title} className="k-step">
                <span className="k-step__n num" aria-hidden="true">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="k-step__time g-meta">{step.time}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── About ────────────────────────────────────────────── */}
        <section id="about" className="k-about g-wrap g-grid" data-ground="night" aria-labelledby="about-title">
          <div className="k-about__photo" data-reveal="up">
            <Image src="/media/abdellah-kachani.jpg" alt={t.about.photoAlt} width={1500} height={2000} sizes="(min-width: 768px) 40vw, 100vw" />
            <span className="k-anchor k-anchor--about" data-robot-anchor="stand" data-robot-say={dict.robot.about} aria-hidden="true" />
          </div>
          <div className="k-about__text">
            <h2 id="about-title" className="g-title" data-split="lines">{t.about.title}</h2>
            {t.about.body.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <dl className="k-facts">
              {t.about.facts.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd>{fill(f.v, { month })}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Questions ────────────────────────────────────────── */}
        <section className="g-questions g-wrap" data-ground="night" aria-labelledby="questions-title">
          <div className="k-head">
            <h2 id="questions-title" className="g-title" data-split="lines">{t.questions.title}</h2>
          </div>
          <div className="g-qa">
            {dict.faq.items.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* ── Finale ─────────────────────────────────────────────── */}
      <footer id="contact" className="g-finale g-wrap" data-ground="field">
        <div>
          {/* Closing shot: the same heat as the opening, condensing as it scrolls in. */}
          <HeatWord mode="finale" className="k-word--finale">
            <h2>
              <span className="g-finale__title" data-heat-text>
                {t.finale.title}
              </span>
            </h2>
          </HeatWord>
          <p className="g-finale__lead">{t.finale.text}</p>
          <span className="k-anchor k-anchor--finale" data-robot-anchor="wave" data-robot-say={dict.robot.finale} aria-hidden="true" />
          <Brief />
        </div>
        <div className="g-small">
          <p>
            © {new Date().getFullYear()} {t.finale.small}
          </p>
          <nav aria-label="Footer">
            <a href={`/${lang}/lab`}>{t.hero.labTitle}</a>
            <a href={`/${lang}/studios`}>{lang === "fr" ? "Agences" : "Studios"}</a>
            <a href="https://www.linkedin.com/in/abdellah-kachani-8284a5251" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/kachaniabdellah86" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={`/${lang === "fr" ? "en" : "fr"}`} hrefLang={lang === "fr" ? "en" : "fr"}>{lang === "fr" ? "English" : "Français"}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
