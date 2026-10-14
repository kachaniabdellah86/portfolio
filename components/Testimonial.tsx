import type { Dictionary } from "@/lib/dictionaries/en";
import { Reveal } from "./Marquee";

// Renders nothing until a real client quote is in the dictionary.
export default function Testimonial({ t }: { t: Dictionary["testimonial"] }) {
  if (!t.quote) return null;

  return (
    <section aria-label={t.label} className="relative px-6 py-24 sm:px-12 sm:py-32">
      <Reveal>
        <p className="label-caps accent">{t.label}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <figure className="mt-8 max-w-4xl">
          <blockquote className="serif text-[clamp(1.8rem,4vw,3.2rem)] italic leading-[1.15] text-[var(--ink)]">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-8 flex flex-col gap-1">
            <span className="text-base font-semibold text-[var(--ink)]">{t.author}</span>
            <span className="label-caps text-white/60">{t.role}</span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
