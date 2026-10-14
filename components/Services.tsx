import type { Dictionary } from "@/lib/dictionaries/en";
import { fill } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { Reveal } from "./Marquee";
import Rich from "./Rich";

export default function Services({
  t,
  numeral,
}: {
  t: Dictionary["services"];
  numeral: string;
}) {
  return (
    <section id="services" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral" data-numeral={numeral} />
      <span
        aria-hidden="true"
        className="edge-label label-caps absolute left-3 top-40 hidden text-faint lg:block"
      >
        {t.edge}
      </span>

      <Reveal>
        <p className="label-caps accent">{t.label}</p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          {t.intro}
        </p>
      </Reveal>

      <div className="mt-16 grid gap-5 lg:grid-cols-3">
        {t.packages.map((pkg, i) => (
          <Reveal key={pkg.name} delay={i * 0.06}>
            <article
              className={`relative flex h-full flex-col rounded-3xl border p-7 sm:p-8 ${
                pkg.featured
                  ? "border-[var(--accent)]/50 bg-[linear-gradient(180deg,rgba(91,143,255,0.12),rgba(91,143,255,0.02))] shadow-[0_24px_60px_rgba(91,143,255,0.12)]"
                  : "border-white/10 bg-white/[0.025]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="serif accent text-xl italic">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {pkg.featured && (
                  <span className="rounded-full bg-[var(--accent-strong)] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white">
                    {t.featuredBadge}
                  </span>
                )}
              </div>

              <h3 className="display mt-6 text-3xl tracking-tight sm:text-4xl">{pkg.name}</h3>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{pkg.price}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">{pkg.pitch}</p>

              <ul className="mt-6 grid gap-2.5 border-t border-white/10 pt-6 text-sm text-white/80">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span aria-hidden="true" className="accent">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
              <a
                href={whatsappUrl(fill(t.ctaMessage, { name: pkg.name }))}
                target="_blank"
                rel="noopener noreferrer"
                data-track="package_cta"
                data-track-label={pkg.name}
                className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                  pkg.featured
                    ? "bg-[var(--accent-strong)] text-white"
                    : "border border-white/20 text-white hover:border-[var(--accent)]"
                }`}
              >
                {t.cta} <span aria-hidden="true">→</span>
              </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <ul className="mt-8 grid gap-2 text-sm text-white/60">
          {t.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
