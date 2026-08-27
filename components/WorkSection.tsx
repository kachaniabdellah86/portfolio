"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { Reveal } from "./Marquee";

import { EASE_OUT as EASE } from "./tokens";

function useTilt(enabled: boolean) {
  const rx = useSpring(0, { stiffness: 180, damping: 20 });
  const ry = useSpring(0, { stiffness: 180, damping: 20 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!enabled) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    
    rx.set((0.5 - py) * 7);
    ry.set((px - 0.5) * 9);
    
    el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
  };

  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return {
    onPointerMove,
    onPointerLeave,
    style: enabled
      ? ({ rotateX: rx, rotateY: ry, transformPerspective: 900 } as const)
      : {},
  };
}

type Project = {
  index: string;
  title: string;
  subtitle: string;
  tags: string[];
  year: string;
  tone: string;
  cursorBg?: string;
  href?: string;
  live?: boolean;
  image?: string;
};

const PROJECTS: Project[] = [
  {
    index: "01",
    title: "Yalla China",
    subtitle:
      "Multilingual study-abroad platform — trust-centered journey for Moroccan families (FR/EN/AR).",
    tags: ["Next.js", "i18n + RTL", "Conversion"],
    year: "2025",
    tone: "from-[#0c1433] via-[#0f1a40] to-[#080b18]",
    cursorBg: "linear-gradient(135deg, #0c1433 0%, #1a2f6b 60%, #5b8fff 135%)",
    href: "https://go-china-site.vercel.app/fr",
    live: true,
    image: "/media/yallachina-preview.webp",
  },
  {
    index: "02",
    title: "Kachanios",
    subtitle:
      "Designing the interface for a self-evolving AI agent — neural graph architecture, AST inspection and autonomous cognition.",
    tags: ["Product UX", "AI Interfaces", "Desktop OS"],
    year: "2026",
    tone: "from-[#0a1128] via-[#0e1738] to-[#060b18]",
    cursorBg: "linear-gradient(135deg, #0a1128 0%, #1c2b5e 65%, #5b8fff 140%)",
    live: false,
    image: "/media/kachanios-preview.webp",
  },
  {
    index: "03",
    title: "Aura Pay",
    subtitle:
      "Next-generation spatial finance & wealth OS — titanium cards, automated yield routing and instant biometric settlements.",
    tags: ["iOS / Swift", "FinTech UX", "Spatial Design"],
    year: "2026",
    tone: "from-[#140e28] via-[#1a1236] to-[#0a0718]",
    cursorBg: "linear-gradient(135deg, #140e28 0%, #301f5c 65%, #a855f7 140%)",
    live: false,
    image: "/media/aurapay-preview.webp",
  },
];

/* ── High-res 2K Visual Preview Panel ── */
function ProjectPreview({ project }: { project: Project }) {
  return (
    <div
      className={`relative h-[240px] sm:h-[320px] md:h-[360px] w-full overflow-hidden rounded-xl bg-gradient-to-br ${project.tone}`}
    >
      {/* High-res Crisp Visual Preview */}
      {project.image && (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
            className="object-cover object-top opacity-95 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            priority={project.index === "01"}
          />
          {/* Subtle bottom vignette for depth without blurring detail */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b18]/60 via-transparent to-transparent opacity-40 transition-opacity duration-700 group-hover:opacity-10" />
        </div>
      )}

      {/* Noise grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Inner glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(91,143,255,0.12) 0%, transparent 65%)",
        }}
      />

      {/* Cursor-tracked glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(91,143,255,0.18), transparent 65%)",
        }}
      />

      {/* Live badge or Concept Pill */}
      {project.live ? (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[rgba(91,143,255,0.18)] px-3 py-1 backdrop-blur-md">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          <span className="label-caps accent">Live ↗</span>
        </div>
      ) : (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-white/60" />
          <span className="label-caps text-white/80">Concept</span>
        </div>
      )}
    </div>
  );
}

function Card({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  // Anti-Lag 2.0: We re-enabled 3D wobble, but completely removed CSS filters 
  // from the iframe itself, which was the actual cause of the browser lag.
  const tilt = useTilt(!reduce);

  const previewClass = `block card-glow rounded-xl border border-[var(--hairline)] will-change-transform ${
    project.href ? "cursor-pointer" : ""
  }`;

  return (
    <Reveal>
      <motion.article
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="group hairline-t py-8"
      >
        {/* Header row */}
        <div className="mb-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-4">
            <span className="serif accent text-xl italic">{project.index}</span>
            <h3 className="display text-2xl tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-4xl">
              {project.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="label-caps text-muted">{project.year}</p>
            <p className={`label-caps mt-1 ${project.live ? "accent" : "text-[var(--faint)]"}`}>
              {project.live ? "Live ↗" : "Soon"}
            </p>
          </div>
        </div>

        {/* Visual preview */}
        {project.href ? (
          <motion.a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className={previewClass}
            data-cursor="view"
            data-cursor-img={project.cursorBg}
            {...tilt}
          >
            <ProjectPreview project={project} />
          </motion.a>
        ) : (
          <motion.div
            className={previewClass}
            data-cursor-img={project.cursorBg}
            {...tilt}
          >
            <ProjectPreview project={project} />
          </motion.div>
        )}

        {/* Footer row */}
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            {project.subtitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--hairline)] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export default function WorkSection() {
  return (
    <section id="work" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral">
        01
      </span>
      <span
        aria-hidden="true"
        className="edge-label label-caps absolute left-3 top-40 hidden text-faint lg:block"
      >
        Selected Work — 2025 / 2026
      </span>

      <Reveal>
        <p className="label-caps accent">Selected Work</p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          Work that <span className="text-outline">shipped,</span>
          <br />
          thinking that{" "}
          <em className="serif accent text-[1.06em] italic">lasted.</em>
        </h2>
      </Reveal>

      <div className="mt-16">
        {PROJECTS.map((project) => (
          <Card key={project.index} project={project} />
        ))}
      </div>
    </section>
  );
}
