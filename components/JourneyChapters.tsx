"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { scrollBus } from "./lenis-bridge";
import { useReducedMotionPreference } from "./use-reduced-motion";

type Chapter = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  range: [number, number];
  align: "left" | "right";
  intro?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    id: "arrival",
    eyebrow: "Scroll-driven portfolio / 2026",
    title: (
      <>
        Enter the work<span className="accent">.</span>
        <br />
        Don&apos;t just watch it.
      </>
    ),
    description:
      "A live 3D journey through product systems, spatial finance, and multilingual experience design.",
    range: [0, 0.19],
    align: "left",
    intro: true,
  },
  {
    id: "kachanios",
    eyebrow: "01 / KachaniOS — Agentic systems",
    title: (
      <>
        An intelligence system
        <br />
        with a <em className="serif accent italic">visible mind.</em>
      </>
    ),
    description:
      "A cognitive operating system where planning, memory, execution, and verification become one legible interface.",
    range: [0.14, 0.42],
    align: "right",
  },
  {
    id: "aura-pay",
    eyebrow: "02 / Aura Pay — Spatial finance",
    title: (
      <>
        Money that feels
        <br />
        immediate, calm, <em className="serif accent italic">alive.</em>
      </>
    ),
    description:
      "A secure wealth OS shaped around biometric settlement, titanium tactility, and clear financial momentum.",
    range: [0.37, 0.66],
    align: "left",
  },
  {
    id: "yalla-china",
    eyebrow: "03 / Yalla China — Multilingual trust",
    title: (
      <>
        One journey across
        <br />
        languages and <em className="serif accent italic">borders.</em>
      </>
    ),
    description:
      "A conversion-focused study-abroad platform that makes a complex decision feel credible to students and families.",
    range: [0.61, 0.88],
    align: "right",
  },
  {
    id: "handoff",
    eyebrow: "Three worlds / One practice",
    title: (
      <>
        Now see the interfaces
        <br />
        behind the <em className="serif accent italic">worlds.</em>
      </>
    ),
    description:
      "Continue into the working prototypes, interaction systems, and decisions behind each project.",
    range: [0.83, 1],
    align: "left",
  },
];

function ChapterPanel({
  chapter,
  progress,
}: {
  chapter: Chapter;
  progress: MotionValue<number>;
}) {
  const Heading = chapter.intro ? "h1" : "h2";
  const [start, end] = chapter.range;
  const fadeInEnd = start + Math.min(0.055, (end - start) * 0.32);
  const fadeOutStart = end - Math.min(0.055, (end - start) * 0.28);
  const opacity = useTransform(
    progress,
    chapter.intro
      ? [start, fadeOutStart, end]
      : [start, fadeInEnd, fadeOutStart, end],
    chapter.intro ? [1, 1, 0] : [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [start, fadeInEnd, fadeOutStart, end],
    chapter.intro ? [0, 0, -24, -64] : [64, 0, 0, -64],
  );
  const blur = useTransform(
    progress,
    [start, fadeInEnd, fadeOutStart, end],
    chapter.intro
      ? ["blur(0px)", "blur(0px)", "blur(0px)", "blur(10px)"]
      : ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"],
  );

  return (
    <motion.article
      data-journey-chapter={chapter.id}
      style={{ opacity, y, filter: blur }}
      className={`pointer-events-none absolute inset-0 flex items-center px-6 py-28 sm:px-12 ${
        chapter.align === "right" ? "justify-end text-right" : "justify-start"
      }`}
    >
      <div className="max-w-[min(46rem,78vw)]">
        <p className="label-caps accent">{chapter.eyebrow}</p>
        <Heading
          className={`display mt-6 text-[clamp(2.8rem,6.2vw,6.6rem)] leading-[0.98] tracking-[-0.025em] ${
            chapter.intro ? "max-w-[12ch]" : ""
          }`}
        >
          {chapter.title}
        </Heading>
        <p
          className={`mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg ${
            chapter.align === "right" ? "ml-auto" : ""
          }`}
        >
          {chapter.description}
        </p>
      </div>
    </motion.article>
  );
}

function StaticChapter({ chapter }: { chapter: Chapter }) {
  const Heading = chapter.intro ? "h1" : "h2";

  return (
    <article
      data-journey-chapter={chapter.id}
      className={`flex min-h-[78svh] items-center px-6 py-24 sm:px-12 ${
        chapter.align === "right" ? "justify-end text-right" : "justify-start"
      }`}
    >
      <div className="max-w-3xl">
        <p className="label-caps accent">{chapter.eyebrow}</p>
        <Heading className="display mt-6 text-[clamp(2.6rem,6vw,6rem)] leading-[1] tracking-[-0.025em]">
          {chapter.title}
        </Heading>
        <p
          className={`mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg ${
            chapter.align === "right" ? "ml-auto" : ""
          }`}
        >
          {chapter.description}
        </p>
      </div>
    </article>
  );
}

export default function JourneyChapters() {
  const reduceMotion = useReducedMotionPreference();
  const trackRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    damping: 30,
    mass: 0.18,
    stiffness: 115,
  });

  useMotionValueEvent(progress, "change", (value) => {
    scrollBus.journeyProgress = value;
  });

  useEffect(() => {
    scrollBus.journeyProgress = 0;
    return () => {
      scrollBus.journeyProgress = 0;
    };
  }, []);

  if (reduceMotion) {
    return (
      <section ref={trackRef} aria-label="Portfolio journey">
        {CHAPTERS.map((chapter) => (
          <StaticChapter key={chapter.id} chapter={chapter} />
        ))}
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      aria-label="Scroll-driven portfolio journey"
      className="relative h-[520vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {CHAPTERS.map((chapter) => (
          <ChapterPanel key={chapter.id} chapter={chapter} progress={progress} />
        ))}

        <div className="absolute bottom-8 left-6 right-6 flex items-center gap-4 sm:left-12 sm:right-12">
          <span className="label-caps text-white/35">Journey</span>
          <div className="h-px flex-1 overflow-hidden bg-white/10">
            <motion.div
              style={{ scaleX: progress }}
              className="h-full origin-left bg-gradient-to-r from-[#5b8fff] via-[#9d7bff] to-[#ff6b55]"
            />
          </div>
          <span className="label-caps text-white/35">Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
