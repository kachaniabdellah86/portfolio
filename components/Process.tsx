"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { Reveal } from "./Marquee";
import Rich from "./Rich";
import { useReducedMotionPreference } from "./use-reduced-motion";

const SIGNAL = "linear-gradient(90deg, #5b8fff, #9d7bff 55%, #ffb36b)";
const SIGNAL_DOWN = "linear-gradient(180deg, #5b8fff, #9d7bff 55%, #ffb36b)";

// The journey's signal line again: it runs through the four steps and
// lights each one as the visitor scrolls past it.
export default function Process({ t }: { t: Dictionary["process"] }) {
  const reduce = useReducedMotionPreference();
  const trackRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 0.8", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [reached, setReached] = useState(reduce ? t.steps.length : 0);
  const count = t.steps.length;

  useMotionValueEvent(progress, "change", (value) => {
    if (reduce) return;
    // Step i lights once the line has reached its node.
    setReached(Math.min(count, Math.floor(value * (count - 1) + 1.15)));
  });

  const fill = reduce ? 1 : progress;

  return (
    <section id="process" className="relative overflow-hidden px-6 py-24 sm:px-12 sm:py-36">
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

      <ol ref={trackRef} className="relative mt-16 grid gap-12 sm:mt-24 md:grid-cols-4 md:gap-8">
        {/* Phone: vertical line on the left. */}
        <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10 md:hidden" />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-2 left-[7px] top-2 w-px origin-top md:hidden"
          style={{ scaleY: fill, background: SIGNAL_DOWN, boxShadow: "0 0 12px rgba(91,143,255,0.6)" }}
        />
        {/* Wider screens: horizontal line through the nodes. */}
        <span aria-hidden="true" className="absolute inset-x-0 top-[3.1rem] hidden h-px bg-white/10 md:block" />
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-[3.1rem] hidden h-px origin-left md:block"
          style={{ scaleX: fill, background: SIGNAL, boxShadow: "0 0 12px rgba(91,143,255,0.6)" }}
        />

        {t.steps.map((step, i) => {
          const lit = reduce || i < reached;
          return (
            <li key={step.title} className="relative pl-10 md:pl-0">
              <p
                className={`font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-500 md:h-8 ${
                  lit ? "text-[var(--ink)]" : "text-white/60"
                }`}
              >
                {step.time}
              </p>

              <span
                aria-hidden="true"
                className={`absolute left-0 top-0.5 flex size-[15px] items-center justify-center rounded-full border transition-all duration-500 md:static md:mt-[0.65rem] md:mb-8 ${
                  lit
                    ? "border-[var(--accent)] bg-[var(--accent)] shadow-[0_0_18px_rgba(91,143,255,0.9)]"
                    : "border-white/30 bg-[var(--bg)]"
                }`}
              >
                <span className={`size-1.5 rounded-full ${lit ? "bg-white" : "bg-transparent"}`} />
              </span>

              <div
                className={`mt-3 transition-all duration-700 md:mt-0 ${
                  lit ? "translate-y-0" : "translate-y-2"
                }`}
              >
                <span className="serif accent text-lg italic">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-2 text-[clamp(1.8rem,2.6vw,2.4rem)] leading-[1.05] tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70 sm:text-base">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
