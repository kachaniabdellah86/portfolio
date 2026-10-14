import type { Dictionary } from "@/lib/dictionaries/en";
import { Reveal } from "./Marquee";
import Rich from "./Rich";

export default function Process({ t }: { t: Dictionary["process"] }) {
  return (
    <section id="process" className="relative px-6 py-24 sm:px-12 sm:py-32">
      <Reveal>
        <p className="label-caps accent">{t.label}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
        </h2>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{t.intro}</p>
      </Reveal>

      <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((step, i) => (
          <li key={step.title} className="bg-[var(--bg)] p-7 sm:p-8">
            <Reveal delay={i * 0.05}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="serif accent text-2xl italic">{String(i + 1).padStart(2, "0")}</span>
                <span className="label-caps text-white/60">{step.time}</span>
              </div>
              <h3 className="display mt-6 text-2xl tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
