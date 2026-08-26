"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { EASE_OUT as EASE, HERO_INTRO_DELAY as INTRO_DELAY } from "./tokens";
import PinnedScene from "./scroll/PinnedScene";
import { scrollBus } from "./lenis-bridge";

function LineMask({
  children,
  delay = 0,
  depth = 0,
  mvX,
}: {
  children: React.ReactNode;
  delay?: number;
  depth?: number;
  mvX: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const x = useTransform(mvX, [-1, 1], [-depth, depth]);
  if (reduce) return <span className="block">{children}</span>;

  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <motion.span
        className="block will-change-transform"
        style={{ x }}
        initial={{ y: "112%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function HeroStage({
  p,
  mvX,
  reduce,
}: {
  p: MotionValue<number>;
  mvX: MotionValue<number>;
  reduce: boolean | null;
}) {
  const { scrollY } = useScroll();
  const cueOpacity = useTransform(scrollY, [0, 240], [1, 0]);

  const stageScale = useTransform(p, [0, 1], [1, 1.14]);
  const stageY = useTransform(p, [0, 1], [0, -70]);
  const headFade = useTransform(p, [0.72, 0.98], [1, 0]);
  const chromeFade = useTransform(p, [0.82, 1], [1, 0]);
  const bottomFade = useTransform(p, [0.45, 0.72], [1, 0]);

  useMotionValueEvent(p, "change", (v) => {
    scrollBus.heroProgress = v;
  });

  return (
    <section
      className="relative flex h-full flex-col justify-between px-6 pb-10 pt-28 sm:px-12"
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mvX.set(((e.clientX - r.left) / r.width) * 2 - 1);
      }}
      onPointerLeave={() => mvX.set(0)}
    >

      <motion.div style={{ opacity: chromeFade }} className="flex items-center justify-between">
        <p className="label-caps text-muted">Portfolio — 2026</p>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.8, delay: INTRO_DELAY + 0.8 }}
          className="flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--bg-soft)] px-3 py-1.5"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="label-caps">Available for work</span>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ scale: stageScale, y: stageY, opacity: headFade }}
        className="origin-center py-10 will-change-transform"
      >
        <h1 className="display text-[clamp(2.6rem,7.5vw,7.25rem)] leading-[1.04]">
          <LineMask delay={INTRO_DELAY} depth={16} mvX={mvX}>
            <span className="block pl-[4vw]">Designing</span>
          </LineMask>
          <LineMask delay={INTRO_DELAY + 0.09} depth={34} mvX={mvX}>
            <span className="text-outline block pl-[16vw]">interfaces</span>
          </LineMask>
          <LineMask delay={INTRO_DELAY + 0.18} depth={8} mvX={mvX}>
            <span className="block">
              that feel{" "}
              <em className="serif accent text-[1.08em] italic">cinematic</em>
            </span>
          </LineMask>
          <LineMask delay={INTRO_DELAY + 0.27} depth={22} mvX={mvX}>
            <span className="block pl-[10vw]">
              &amp; work beautifully<span className="accent">.</span>
            </span>
          </LineMask>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: INTRO_DELAY + 0.45 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
        >
          Abdellah Kachani. I design interfaces that earn trust through motion,
          clarity, and detail — for teams that care about both craft and
          conversion.
        </motion.p>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ duration: 1, delay: INTRO_DELAY + 0.7 }}
        className="hairline-t flex flex-wrap items-center justify-between gap-4 pt-5"
      >
        <motion.div
          style={{ opacity: bottomFade }}
          className="flex w-full flex-wrap items-center justify-between gap-4"
        >
          <motion.div
            style={{ opacity: cueOpacity }}
            className="flex flex-wrap items-center gap-4 sm:gap-8"
          >
            <span className="label-caps text-muted">3+ years</span>
            <span className="text-[var(--faint)] hidden sm:inline">·</span>
            <span className="label-caps text-muted">10+ projects shipped</span>
            <span className="text-[var(--faint)] hidden sm:inline">·</span>
            <span className="label-caps text-muted">Casablanca / Remote</span>
          </motion.div>

          <span
            className="label-caps text-muted"
            style={{
              animation:
                reduce ? undefined : "floatCue 2.4s ease-in-out infinite",
            }}
          >
            Scroll ↓
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const mvX = useMotionValue(0);

  return (
    <PinnedScene track="280vh">
      {(p) => <HeroStage p={p} mvX={mvX} reduce={reduce} />}
    </PinnedScene>
  );
}
