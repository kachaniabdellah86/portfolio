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
      "Designing the interface for a self-evolving AI agent — cognition, memory and control.",
    tags: ["Product UX", "AI Interfaces", "Concept"],
    year: "2026",
    tone: "from-[#0e1428] via-[#111830] to-[#080a14]",
    cursorBg: "linear-gradient(135deg, #0e1428 0%, #232c5c 65%, #7c6fff 140%)",
    live: false,
  },
  {
    index: "03",
    title: "Coming soon",
    subtitle: "Mobile app concept — in the design phase right now.",
    tags: ["Mobile", "UI Design"],
    year: "2026",
    tone: "from-[#10131f] via-[#12162a] to-[#090b12]",
    cursorBg: "linear-gradient(135deg, #10131f 0%, #20263f 70%, #3a4166 140%)",
    live: false,
  },
];

/* ── Interactive Kachani.OS AI Cockpit Component ── */
function KachaniosCockpit() {
  const [activeTab, setActiveTab] = useState<"autonomous" | "neural" | "evolve">("autonomous");
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const logs = {
    autonomous: [
      { tag: "COGNITION", text: "Goal parsed: Autonomous pipeline iteration #14", color: "text-[var(--accent)]" },
      { tag: "DELEGATE", text: "Spawned subagent @code-architect with sandboxed AST context", color: "text-emerald-400" },
      { tag: "MEMORY", text: "Cosine similarity: 0.942 · 1,420 vault vectors referenced", color: "text-indigo-300" },
      { tag: "VERIFIER", text: "Convergence loop passed: 0 defects · 120 FPS latency", color: "text-amber-300" },
    ],
    neural: [
      { tag: "CLUSTER", text: "Global memory graph active: 24 shared subagent vaults", color: "text-indigo-400" },
      { tag: "EMBED", text: "Dimension: 1536-dim · Dynamic context window 24.8k / 200k", color: "text-[var(--accent)]" },
      { tag: "RETRIEVE", text: "Semantic query: 'anti-lag hardware layer composition'", color: "text-emerald-400" },
      { tag: "HANDOFF", text: "Direct memory handoff to synthesis worker complete", color: "text-cyan-300" },
    ],
    evolve: [
      { tag: "INSTINCT", text: "Distilled pattern: Zero-DOM obstruction cursor rules", color: "text-amber-400" },
      { tag: "SCORING", text: "Quality rubric: 5/5 Accuracy · 5/5 Actionability", color: "text-emerald-400" },
      { tag: "MUTATION", text: "Promoted temporary tactic to durable project rule", color: "text-[var(--accent)]" },
      { tag: "CHECKPOINT", text: "Model weights context snapshot secured · Hash #a8f09c", color: "text-purple-300" },
    ],
  };

  const nodes = [
    { id: "core", label: "Kernel", x: "50%", y: "45%", ring: true },
    { id: "planner", label: "Planner", x: "20%", y: "24%" },
    { id: "memory", label: "Vault", x: "80%", y: "24%" },
    { id: "tools", label: "Harness", x: "20%", y: "76%" },
    { id: "eval", label: "Evals", x: "80%", y: "76%" },
  ];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-4 sm:p-5 font-mono select-none pointer-events-auto">
      {/* ── 1. Top HUD Ribbon ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 z-10">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_#5b8fff] animate-pulse" />
          <span className="text-[0.65rem] sm:text-xs font-bold tracking-wider text-white">
            KACHANI.OS <span className="text-white/40 font-normal hidden sm:inline">v2.4 // KERNEL</span>
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-1 rounded-full border border-white/10 bg-black/50 p-0.5 backdrop-blur-md">
          {(["autonomous", "neural", "evolve"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab);
              }}
              className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[0.55rem] uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(91,143,255,0.5)] font-semibold"
                  : "text-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Middle Cockpit Arena (Two-column HUD) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto items-center py-2 z-10">
        {/* Left: Terminal Telemetry Stream */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-1.5 bg-black/40 rounded-xl border border-white/10 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between text-[0.55rem] text-muted/60 border-b border-white/5 pb-1">
            <span>LIVE AGENT TELEMETRY</span>
            <span className="text-emerald-400/90 font-semibold">120 FPS · 8ms</span>
          </div>

          <div className="space-y-1">
            {logs[activeTab].map((log, i) => (
              <motion.div
                key={`${activeTab}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex items-start gap-1.5 text-[0.6rem] leading-tight"
              >
                <span className={`font-semibold ${log.color}`}>[{log.tag}]</span>
                <span className="text-white/80 line-clamp-1">{log.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Neural Node Orbitals */}
        <div className="hidden md:flex md:col-span-5 relative h-28 w-full items-center justify-center">
          {/* Laser Vectors SVG */}
          <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none opacity-40">
            <line x1="50%" y1="45%" x2="20%" y2="24%" stroke="#5b8fff" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50%" y1="45%" x2="80%" y2="24%" stroke="#5b8fff" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50%" y1="45%" x2="20%" y2="76%" stroke="#5b8fff" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50%" y1="45%" x2="80%" y2="76%" stroke="#5b8fff" strokeWidth="1" strokeDasharray="2 2" />
          </svg>

          {nodes.map((node) => {
            const isHovered = activeNode === node.id;
            return (
              <motion.div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                style={{ left: node.x, top: node.y }}
                whileHover={{ scale: 1.15 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg border px-2 py-0.5 backdrop-blur-md transition-all ${
                  node.ring
                    ? "bg-[var(--accent)]/20 border-[var(--accent)] text-white shadow-[0_0_15px_rgba(91,143,255,0.4)]"
                    : isHovered
                    ? "bg-white/20 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`size-1 rounded-full ${
                      node.ring ? "bg-[var(--accent)]" : "bg-white/50"
                    }`}
                  />
                  <span className="text-[0.55rem] font-bold">{node.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Bottom Metrics Footer ── */}
      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[0.55rem] text-muted z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-white/40">STATUS:</span>
            <span className="text-emerald-400 font-semibold">AUTONOMOUS</span>
          </span>
          <span>·</span>
          <span>SUBAGENTS: 4 ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">SELF-EVAL:</span>
          <span className="text-[var(--accent)] font-semibold">99.8% PRECISION</span>
        </div>
      </div>
    </div>
  );
}

/* ── Gradient preview panel ── */
function ProjectPreview({ project }: { project: Project }) {
  return (
    <div
      className={`relative h-[240px] sm:h-[300px] w-full overflow-hidden rounded-xl bg-gradient-to-br ${project.tone}`}
    >
      {/* Interactive Kachani.OS AI Cockpit (Card 02) */}
      {project.index === "02" && <KachaniosCockpit />}

      {/* High-res Crisp Visual Preview (Card 01) */}
      {project.image && (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
            className="object-cover object-top opacity-90 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            priority={project.index === "01"}
          />
          {/* Subtle bottom vignette for depth without blurring detail */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b18]/60 via-transparent to-transparent opacity-50 transition-opacity duration-700 group-hover:opacity-20" />
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

      {/* Index number watermark for cards without live UI */}
      {!project.image && project.index !== "02" && (
        <span
          className="pointer-events-none absolute bottom-4 right-6 text-[5rem] font-bold leading-none opacity-[0.06]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {project.index}
        </span>
      )}

      {/* Live badge */}
      {project.live && (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[rgba(91,143,255,0.18)] px-3 py-1 backdrop-blur-md">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          <span className="label-caps accent">Live</span>
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
