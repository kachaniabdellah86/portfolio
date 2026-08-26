"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Reveal } from "./Marquee";

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

const STATS: Stat[] = [
  { value: 3, suffix: "+", label: "Years of craft" },
  { value: 12, suffix: "+", label: "Projects designed" },
  { value: 3, suffix: "", label: "Working languages" },
];

function Counter({ stat }: { stat: Stat }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      const raf = requestAnimationFrame(() => setDisplay(stat.value));
      return () => cancelAnimationFrame(raf);
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
    <span
      ref={ref}
      className="display text-5xl tabular-nums tracking-tight sm:text-7xl"
    >
      {String(display).padStart(2, "0")}
      <span className="accent">{stat.suffix}</span>
    </span>
  );
}

export default function Stats() {
  return (
    <section aria-label="By the numbers" className="px-6 pb-24 sm:px-12 sm:pb-32">
      <div className="hairline-t grid gap-12 pt-14 sm:grid-cols-3 sm:gap-8">
        {STATS.map((stat) => (
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
