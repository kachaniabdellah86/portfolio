import type { Dictionary } from "@/lib/dictionaries/en";
import { contactEmail, whatsappUrl } from "@/lib/site";
import { Reveal } from "./Marquee";
import Rich from "./Rich";

const SOCIAL = [
  { label: "GitHub", href: "https://github.com/kachaniabdellah86" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/abdellah-kachani-8284a5251/" },
];

export default function About({
  t,
  numeral,
  whatsappMessage,
}: {
  t: Dictionary["about"];
  numeral: string;
  whatsappMessage: string;
}) {
  return (
    <section id="about" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral">
        {numeral}
      </span>

      <Reveal>
        <p className="label-caps accent">{t.label}</p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
        </h2>
      </Reveal>

      <div className="mt-12 grid max-w-3xl gap-8">
        <Reveal delay={0.12}>
          <div className="grid gap-3">
            {t.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`text-base leading-relaxed sm:text-lg ${i === 0 ? "text-white/80" : "text-white/70"}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="grid gap-3 border-t border-white/8 pt-8">
            <p className="label-caps text-white/60">{t.interestsLabel}</p>
            <div className="flex flex-wrap gap-2">
              {t.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="grid gap-3 border-t border-white/8 pt-8">
            <p className="label-caps text-white/60">{t.connectLabel}</p>
            <div className="flex flex-wrap gap-3 text-sm">
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
                  className="text-white/65 transition-colors hover:text-[var(--accent)]"
                >
                  {label} →
                </a>
              ))}
              <a
                href={`mailto:${contactEmail}`}
                data-track="email_click"
                data-track-label="about"
                className="text-white/65 transition-colors hover:text-[var(--accent)]"
              >
                Email →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
