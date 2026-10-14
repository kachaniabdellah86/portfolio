import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";
import { contactEmail, whatsappUrl } from "@/lib/site";
import { Reveal } from "./Marquee";
import Rich from "./Rich";

const SOCIAL = [
  { label: "GitHub", href: "https://github.com/kachaniabdellah86" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/abdellah-kachani-8284a5251/" },
];

// The portrait, framed like a film still: caption plate, availability tag.
function Portrait({ alt, caption, available }: { alt: string; caption: string; available: string }) {
  return (
    <figure className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--bg-soft)]">
      <Image
        src="/media/abdellah-kachani.jpg"
        width={1500}
        height={2000}
        alt={alt}
        sizes="(min-width: 1024px) 38vw, 92vw"
        className="aspect-[4/5] h-auto w-full object-cover object-[50%_22%] transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(14,14,12,0.85)_100%)]"
      />
      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-white backdrop-blur-md">
        <span className="size-1.5 animate-pulse rounded-full bg-[#25d366]" />
        {available}
      </span>
      <figcaption className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/80">
        <span>
          <span className="display block text-2xl normal-case tracking-tight text-white">Abdellah Kachani</span>
          {caption}
        </span>
        <span>© 2026</span>
      </figcaption>
    </figure>
  );
}

export default function About({
  t,
  numeral,
  whatsappMessage,
  available,
}: {
  t: Dictionary["about"];
  numeral: string;
  whatsappMessage: string;
  available: string;
}) {
  return (
    <section id="about" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral" data-numeral={numeral} />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="label-caps accent">{t.label}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="display mt-5 max-w-3xl text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[1.02]">
              <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 lg:hidden">
            <Portrait alt={t.photoAlt} caption={t.photoCaption} available={available} />
          </Reveal>

          <div className="mt-12 grid max-w-2xl gap-8">
            <Reveal delay={0.12}>
              <div className="grid gap-4">
                {t.paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`leading-relaxed ${i === 0 ? "text-lg text-white/85 sm:text-xl" : "text-base text-white/70 sm:text-lg"}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="grid gap-3 border-t border-white/8 pt-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">{t.interestsLabel}</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-white/80">
                  {t.interests.map((interest, i) => (
                    <li key={interest} className="flex gap-2">
                      <span className="text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                      {interest}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="grid gap-3 border-t border-white/8 pt-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">{t.connectLabel}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  <a
                    href={whatsappUrl(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="whatsapp_click"
                    data-track-label="about"
                    className="text-[var(--accent)] transition-colors hover:text-white"
                  >
                    WhatsApp →
                  </a>
                  {SOCIAL.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 transition-colors hover:text-[var(--accent)]"
                    >
                      {label} →
                    </a>
                  ))}
                  <a
                    href={`mailto:${contactEmail}`}
                    data-track="email_click"
                    data-track-label="about"
                    className="text-white/70 transition-colors hover:text-[var(--accent)]"
                  >
                    Email →
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <Reveal delay={0.1} y={48}>
              <Portrait alt={t.photoAlt} caption={t.photoCaption} available={available} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
