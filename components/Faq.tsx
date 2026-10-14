import type { Dictionary } from "@/lib/dictionaries/en";
import { Reveal } from "./Marquee";
import Rich from "./Rich";

export default function Faq({ t }: { t: Dictionary["faq"] }) {
  return (
    <section id="faq" className="relative px-6 py-24 sm:px-12 sm:py-32">
      <Reveal>
        <p className="label-caps accent">{t.label}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
        </h2>
      </Reveal>

      <div className="mt-14 max-w-3xl">
        {t.items.map((item) => (
          <details key={item.q} className="group hairline-t py-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-[var(--ink)] sm:text-xl">
              {item.q}
              <span
                aria-hidden="true"
                className="accent shrink-0 text-2xl leading-none transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
