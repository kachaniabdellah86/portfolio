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
import { whatsappUrl } from "@/lib/site";
import { scrollBus } from "./lenis-bridge";
import { useLocale } from "./LocaleProvider";
import Rich from "./Rich";
import WhatsAppIcon from "./WhatsAppIcon";
import { useReducedMotionPreference } from "./use-reduced-motion";

type ChapterCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

type Chapter = ChapterCopy & {
  id: string;
  range: [number, number];
  align: "left" | "right";
  intro?: boolean;
};

// Layout only; the words come from the dictionary, in the same order.
const CHAPTER_LAYOUT: Omit<Chapter, keyof ChapterCopy>[] = [
  { id: "spark", range: [0, 0.2], align: "left", intro: true },
  { id: "kachanios", range: [0.15, 0.44], align: "right" },
  { id: "aura-pay", range: [0.39, 0.68], align: "left" },
  { id: "yalla-china", range: [0.63, 0.9], align: "right" },
  { id: "horizon", range: [0.85, 1], align: "left" },
];

function useChapters(): Chapter[] {
  const { dict } = useLocale();
  return CHAPTER_LAYOUT.map((layout, i) => ({ ...layout, ...dict.journey.chapters[i] }));
}

function scrollToWork(reduce: boolean) {
  const target = document.querySelector<HTMLElement>("#work");
  if (!target) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(target, { offset: -24, immediate: reduce });
  else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}

// The two actions a visitor can take from the very first screen.
function HeroActions() {
  const { dict } = useLocale();
  const reduce = useReducedMotionPreference();
  const t = dict.journey;
  return (
    <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
      <a
        href={whatsappUrl(t.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        data-track="whatsapp_click"
        data-track-label="hero"
        className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(91,143,255,0.35)] transition-transform hover:-translate-y-0.5"
      >
        <WhatsAppIcon />
        {t.ctaPrimary}
      </a>
      <a
        href="#work"
        onClick={(event) => {
          event.preventDefault();
          scrollToWork(Boolean(reduce));
        }}
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-white/50"
      >
        {t.ctaSecondary} <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

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
      // Phones skip the blur: re-rasterising a blurred text layer every scroll
      // frame costs more than the whole WebGL frame on a mid-range GPU.
      className={`pointer-events-none absolute inset-0 flex max-md:[filter:none!important] items-end px-6 pb-28 pt-20 sm:items-center sm:px-12 sm:py-28 ${
        chapter.align === "right" ? "justify-end text-right" : "justify-start"
      }`}
    >
      <div className="relative max-w-[min(46rem,78vw)]">
        <div
          aria-hidden="true"
          className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(2,4,11,0.82)_0%,rgba(2,4,11,0.45)_42%,transparent_72%)] md:blur-xl sm:-inset-x-16 sm:-inset-y-12"
        />
        <p className="label-caps accent">{chapter.eyebrow}</p>
        <Heading
          className={`display mt-6 text-[clamp(2.8rem,6.2vw,6.6rem)] leading-[0.98] tracking-[-0.025em] ${
            chapter.intro ? "max-w-[14ch]" : ""
          }`}
        >
          <Rich text={chapter.title} />
        </Heading>
        <p
          className={`mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg ${
            chapter.align === "right" ? "ml-auto" : ""
          }`}
        >
          {chapter.description}
        </p>
        {chapter.intro && <HeroActions />}
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
          <Rich text={chapter.title} />
        </Heading>
        <p
          className={`mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg ${
            chapter.align === "right" ? "ml-auto" : ""
          }`}
        >
          {chapter.description}
        </p>
        {chapter.intro && <HeroActions />}
      </div>
    </article>
  );
}

export default function JourneyChapters() {
  const reduceMotion = useReducedMotionPreference();
  const chapters = useChapters();
  const t = useLocale().dict.journey;
  const chapterLabels = t.labels;
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
      <section ref={trackRef} aria-label={t.ariaLabel}>
        {chapters.map((chapter) => (
          <StaticChapter key={chapter.id} chapter={chapter} />
        ))}
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      aria-label={t.ariaLabel}
      className="relative h-[320vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute left-6 top-7 hidden items-center gap-3 sm:left-12 2xl:flex">
          <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
          <span className="label-caps text-white/40">{t.railLabel}</span>
        </div>

        {chapters.map((chapter) => (
          <ChapterPanel key={chapter.id} chapter={chapter} progress={progress} />
        ))}

        <div className="absolute bottom-7 left-6 right-6 sm:left-12 sm:right-12">
          <div className="mb-3 hidden grid-cols-5 text-[0.56rem] font-medium uppercase tracking-[0.2em] text-white/30 sm:grid">
            {chapterLabels.map((label, index) => (
              <span
                key={label}
                className={index === chapterLabels.length - 1 ? "text-right" : ""}
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
            {chapterLabels.map((label, index) => (
              <span
                key={label}
                aria-hidden="true"
                className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[#030610]"
                style={{ left: `${(index / (chapterLabels.length - 1)) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="label-caps hidden text-white/50 sm:inline">{t.follow}</span>
            <a
              href="#work"
              onClick={(event) => {
                event.preventDefault();
                scrollToWork(false);
              }}
              className="label-caps pointer-events-auto text-white/60 transition-colors hover:text-white"
            >
              {t.skip}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
