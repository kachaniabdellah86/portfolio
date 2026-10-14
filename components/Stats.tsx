"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { Reveal } from "./Marquee";
import { useReducedMotionPreference } from "./use-reduced-motion";
import { useLocale } from "./LocaleProvider";

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

// Only numbers a visitor can check for themselves; the copy lives in the dictionaries.

function Counter({ stat }: { stat: Stat }) {
  const reduce = useReducedMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(stat.value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current || !inView) return;
    hasAnimatedRef.current = true;

    if (reduce) {
      return;
    }

    let raf = 0;
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * stat.value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, stat.value]);

  return (
    <>
      <span className="sr-only">
        {String(stat.value).padStart(2, "0")}{stat.suffix}
      </span>
      <span
        ref={ref}
        aria-hidden="true"
        className="display text-5xl tabular-nums tracking-tight sm:text-7xl"
      >
        {String(display).padStart(2, "0")}
        <span className="accent">{stat.suffix}</span>
      </span>
    </>
  );
}

export default function Stats() {
  const t = useLocale().dict.stats;
  return (
    <section aria-label={t.ariaLabel} className="px-6 py-24 sm:px-12 sm:py-32">
      <div className="hairline-t grid gap-12 pt-14 sm:grid-cols-3 sm:gap-8">
        {t.items.map((stat: Stat) => (
          <Reveal key={stat.label}>
            <div>
              <Counter stat={stat} />
              <p className="label-caps mt-4 text-muted">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
