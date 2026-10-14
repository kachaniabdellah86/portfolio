"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { EASE_OUT as EASE } from "./tokens";
import { useReducedMotionPreference } from "./use-reduced-motion";
import { useLocale } from "./LocaleProvider";

function wrapRange(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

function VelocityRow({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const reduce = useReducedMotionPreference();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [0, 1000],
    [0, 3.5],
    { clamp: false }
  );
  const direction = useRef(reverse ? -1 : 1);

  const x = useTransform(baseX, (v) => `${wrapRange(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = direction.current * 2.6 * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = reverse ? 1 : -1;
    else if (vf > 0) direction.current = reverse ? -1 : 1;
    moveBy += direction.current * moveBy * Math.min(Math.abs(vf), 5);
    baseX.set(baseX.get() + moveBy);
  });

  const doubled = [...items, ...items];

  return (
    <motion.div className="flex w-max gap-10 whitespace-nowrap" style={{ x }}>
      {doubled.map((item, i) => (
        <span
          key={i}
          className="label-caps flex items-center gap-10"
          style={
            reverse
              ? { color: "#8aa9f0" }
              : { color: "var(--muted)" }
          }
        >
          {item}
          <span
            aria-hidden="true"
            className={reverse ? "" : "accent"}
            style={reverse ? { color: "var(--muted)" } : undefined}
          >
            {reverse ? "◆" : "✦"}
          </span>
        </span>
      ))}
    </motion.div>
  );
}

export default function Marquee() {
  const { rowA, rowB } = useLocale().dict.marquee;
  return (
    <div className="hairline-t hairline-b overflow-hidden py-4 select-none">
      <div className="mb-3">
        <VelocityRow items={rowA} />
      </div>
      <VelocityRow items={rowB} reverse />
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 32,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotionPreference();
  if (reduce) return className ? <div className={className}>{children}</div> : <>{children}</>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
