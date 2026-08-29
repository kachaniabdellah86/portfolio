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
    id: "spark",
    eyebrow: "Abdellah Kachani / Creative Developer & Computer Engineering Student",
    title: (
      <>
        This is the line
        <br />
        that made <em className="serif accent italic">me.</em>
      </>
    ),
    description:
      "Not a gallery of screens. A living path through the questions, systems, and products that shaped how I design and build.",
    range: [0, 0.2],
    align: "left",
    intro: true,
  },
  {
    id: "kachanios",
    eyebrow: "Chapter 01 / KachaniOS — The system",
    title: (
      <>
        The interface learned
        <br />
        how to <em className="serif accent italic">think.</em>
      </>
    ),
    description:
      "KachaniOS turned an invisible agent loop into a world people can read: thought becomes nodes, memory becomes structure, and complexity becomes calm.",
    range: [0.15, 0.44],
    align: "right",
  },
  {
    id: "aura-pay",
    eyebrow: "Chapter 02 / Aura Pay — The feeling",
    title: (
      <>
        Digital money found
        <br />
        a physical <em className="serif accent italic">weight.</em>
      </>
    ),
    description:
      "Aura Pay explored how trust can feel tactile—titanium surfaces, spatial data, and biometric moments designed to make finance immediate without making it loud.",
    range: [0.39, 0.68],
    align: "left",
  },
  {
    id: "yalla-china",
    eyebrow: "Chapter 03 / Yalla China — The bridge",
    title: (
      <>
        Design crossed language,
        <br />
        distance, and <em className="serif accent italic">doubt.</em>
      </>
    ),
    description:
      "Yalla China connected students and families across French, English, Arabic, and a life-changing decision—using clarity as the bridge between ambition and trust.",
    range: [0.63, 0.9],
    align: "right",
  },
  {
    id: "horizon",
    eyebrow: "Chapter 04 / What comes next",
    title: (
      <>
        The line is still
        <br />
        being <em className="serif accent italic">drawn.</em>
      </>
    ),
    description:
      "Every project below is another point on it. Scroll on to see the interfaces, prototypes, and decisions behind these worlds.",
    range: [0.85, 1],
    align: "left",
  },
];

const CHAPTER_LABELS = ["Spark", "System", "Feeling", "Bridge", "Next"];

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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(([entry]) => {
      scrollBus.journeyVisible = entry.isIntersecting;
      window.dispatchEvent(new Event("journey-visibility-change"));
    });

    observer.observe(track);
    return () => {
      observer.disconnect();
      scrollBus.journeyVisible = false;
      window.dispatchEvent(new Event("journey-visibility-change"));
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
        <div className="pointer-events-none absolute left-6 top-7 flex items-center gap-3 sm:left-12">
          <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
          <span className="label-caps text-white/40">A life in making</span>
        </div>

        {CHAPTERS.map((chapter) => (
          <ChapterPanel key={chapter.id} chapter={chapter} progress={progress} />
        ))}

        <div className="absolute bottom-7 left-6 right-6 sm:left-12 sm:right-12">
          <div className="mb-3 hidden grid-cols-5 text-[0.56rem] font-medium uppercase tracking-[0.2em] text-white/30 sm:grid">
            {CHAPTER_LABELS.map((label, index) => (
              <span
                key={label}
                className={index === CHAPTER_LABELS.length - 1 ? "text-right" : ""}
              >
                {String(index).padStart(2, "0")} / {label}
              </span>
            ))}
          </div>
          <div className="relative h-px bg-white/10">
            <motion.div
              style={{ scaleX: progress }}
              className="absolute inset-y-0 left-0 right-0 origin-left bg-gradient-to-r from-[#5b8fff] via-[#9d7bff] to-[#ffb36b] shadow-[0_0_12px_rgba(91,143,255,0.65)]"
            />
            {CHAPTER_LABELS.map((label, index) => (
              <span
                key={label}
                aria-hidden="true"
                className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[#030610]"
                style={{ left: `${(index / (CHAPTER_LABELS.length - 1)) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="label-caps text-white/30">Follow the signal</span>
            <span className="label-caps text-white/30">Scroll to move ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
