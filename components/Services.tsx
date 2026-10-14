import type { Dictionary } from "@/lib/dictionaries/en";
import { fill } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { Reveal } from "./Marquee";
import Rich from "./Rich";

// A circular rubber-stamp label, the text running around the ring.
function Stamp({ text, id }: { text: string; id: string }) {
  const ring = `${text} • ${text} • `.toUpperCase();
  return (
    <span aria-hidden="true" className="pointer-events-none relative block size-28 sm:size-32">
      <svg
        viewBox="0 0 100 100"
        className="size-full animate-[spin_18s_linear_infinite] motion-reduce:animate-none"
      >
        <defs>
          <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-[var(--ink)] font-mono" style={{ fontSize: 8.2 }}>
          <textPath href={`#${id}`} textLength="236" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-[var(--accent-strong)] text-lg text-white shadow-[0_0_40px_rgba(91,143,255,0.55)] sm:size-14">
        ★
      </span>
    </span>
  );
}

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

      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="label-caps accent">{t.label}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,5.6rem)] leading-[1.0]">
              <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="lg:col-span-5">
          <p className="max-w-md text-base leading-relaxed text-white/70 sm:text-lg">{t.intro}</p>
        </Reveal>
      </div>

      <ol className="mt-16 border-b border-[var(--hairline)] sm:mt-24">
        {t.packages.map((pkg, i) => (
          <li key={pkg.name}>
            <Reveal delay={i * 0.05}>
              <article
                className={`group relative grid gap-6 border-t border-[var(--hairline)] py-10 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-8 ${
                  pkg.featured
                    ? "-mx-6 bg-[radial-gradient(ellipse_at_62%_50%,rgba(91,143,255,0.15),transparent_62%)] px-6 sm:-mx-12 sm:px-12"
                    : ""
                }`}
              >
                {/* The signal line from the journey, drawn under a row on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#5b8fff] via-[#9d7bff] to-[#ffb36b] transition-transform duration-700 ease-out group-hover:scale-x-100"
                />

                {pkg.featured && (
                  <p className="-mb-2 inline-flex items-center gap-2 justify-self-start rounded-full bg-[var(--accent-strong)] px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white lg:hidden">
                    <span aria-hidden="true">★</span>
                    {t.featuredBadge}
                  </p>
                )}

                <div className="flex items-baseline gap-5 lg:col-span-5">
                  <span className="serif accent text-2xl italic">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-none tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                      {pkg.name}
                    </h3>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
                      {pkg.pitch}
                    </p>
                  </div>
                </div>

                <div className="relative pl-12 lg:col-span-4 lg:pl-0">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/60">
                    {pkg.priceFrom}
                  </p>
                  <p className="mt-1 flex items-start gap-2 leading-none">
                    <span className="display text-[clamp(3.4rem,7vw,6rem)] tabular-nums tracking-[-0.03em]">
                      {pkg.amount}
                    </span>
                    <span className="mt-2 font-mono text-sm text-[var(--accent)]">{pkg.currency}</span>
                  </p>
                  {pkg.featured && (
                    <span className="absolute -top-16 -right-6 hidden lg:block">
                      <Stamp text={t.featuredBadge} id="stamp-ring-wide" />
                    </span>
                  )}
                </div>

                <div className="pl-12 lg:col-span-3 lg:justify-self-end lg:pl-0">
                  <a
                    href={whatsappUrl(fill(t.ctaMessage, { name: pkg.name }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="package_cta"
                    data-track-label={pkg.name}
                    className="group/cta inline-flex items-center gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-16 items-center justify-center rounded-full border text-xl transition-all duration-500 group-hover/cta:rotate-45 ${
                        pkg.featured
                          ? "border-transparent bg-[var(--accent-strong)] text-white"
                          : "border-white/25 text-white group-hover/cta:border-[var(--accent-strong)] group-hover/cta:bg-[var(--accent-strong)]"
                      }`}
                    >
                      ↗
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/85 transition-colors group-hover/cta:text-white">
                      {t.cta}
                      <span className="sr-only"> — {pkg.name}</span>
                    </span>
                  </a>
                </div>

                <ul className="flex flex-wrap gap-x-6 gap-y-2 pl-12 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/65 lg:col-span-12">
                  {pkg.features.map((feature, f) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-[var(--accent)]">{String(f + 1).padStart(2, "0")}</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal delay={0.1}>
        <ul className="mt-8 grid gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/60 sm:grid-cols-2">
          {t.notes.map((note) => (
            <li key={note}>— {note}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
