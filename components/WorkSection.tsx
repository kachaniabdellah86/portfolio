"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useSpring } from "motion/react";
import { Reveal } from "./Marquee";
import { EASE_OUT as EASE } from "./tokens";
import { useReducedMotionPreference } from "./use-reduced-motion";

type Brand = {
  accent: string;
  accentSoft: string;
  background: string;
  ink: string;
};

type Project = {
  id: "kachanios" | "ficam" | "yalla" | "aura";
  index: string;
  title: string;
  meaning: string;
  subtitle: string;
  tags: string[];
  year: string;
  status: string;
  brand: Brand;
  href?: string;
  sourceHref?: string;
  details: {
    role: string;
    problem: string;
    built: string;
    stack: string[];
  };
};

// Real client work first: it is what a business visiting this page needs to see.
const PROJECTS: Project[] = [
  {
    id: "yalla",
    index: "01",
    title: "Yalla China",
    meaning: "From Morocco to a campus in China, step by step.",
    subtitle:
      "A trust-first platform in French, English and Arabic that guides Moroccan students and their families through a seven-step journey to studying in China — and turns visitors into applications and WhatsApp conversations.",
    tags: ["Client project", "FR · EN · AR + RTL", "Lighthouse 96 mobile"],
    year: "2025",
    status: "Client project · Live",
    brand: {
      accent: "#f0b64a",
      accentSoft: "rgba(240,182,74,0.16)",
      background:
        "radial-gradient(ellipse at 74% 34%, rgba(240,182,74,0.16), transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(217,51,63,0.16), transparent 50%), linear-gradient(180deg, #1a0709 0%, #0d0405 100%)",
      ink: "#fff1dc",
    },
    href: "https://go-china-site.vercel.app/fr",
    details: {
      role: "Full-stack developer — design, build and launch for a study-abroad agency",
      problem:
        "Families needed clarity and trust around studying abroad in China. Language and cultural distance created friction; reassurance was missing.",
      built:
        "Trilingual site (French, English, Arabic with right-to-left layout), a seven-step journey, two pricing packs, an application form with server-side validation and spam protection, an admin area to manage applications, and WhatsApp lead capture.",
      stack: ["Next.js", "TypeScript", "Prisma + Supabase", "Tailwind CSS"],
    },
  },
  {
    id: "ficam",
    index: "02",
    title: "FICAM Festival Platform",
    meaning: "Vivez le cinéma — in your pocket.",
    subtitle:
      "The official companion app for the FICAM film festival: student registration, QR-code session validation, gamified progression and live rewards.",
    tags: ["Next.js", "Supabase", "Full-Stack"],
    year: "2024",
    status: "Live product",
    brand: {
      accent: "#e879f9",
      accentSoft: "rgba(168,85,247,0.18)",
      background:
        "radial-gradient(ellipse at 28% 42%, rgba(168,85,247,0.24), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(219,39,119,0.14), transparent 50%), linear-gradient(180deg, #0d0618 0%, #07040f 100%)",
      ink: "#f5e9ff",
    },
    href: "https://ficam-festival-final.vercel.app",
    sourceHref: "https://github.com/kachaniabdellah86/ficam-festival-app",
    details: {
      role: "Full-Stack Developer",
      problem:
        "Festival organizers needed to engage student participants, track attendance, validate screenings and reward engagement across multiple sessions.",
      built:
        "Registration and authentication. QR scanning for session validation. Gamified progression with badges and level unlocks. Real-time reward accumulation.",
      stack: ["Next.js", "TypeScript", "Supabase (PostgreSQL)", "Realtime"],
    },
  },
  {
    id: "kachanios",
    index: "03",
    title: "KachaniOS",
    meaning: "The interface that thinks.",
    subtitle:
      "An operating system for a self-evolving AI agent — routing, memory and verification made visible so people can read what the machine is thinking.",
    tags: ["AI Interfaces", "Product UX", "Desktop OS"],
    year: "2026",
    status: "Interactive prototype",
    brand: {
      accent: "#7fa5ff",
      accentSoft: "rgba(91,143,255,0.16)",
      background:
        "radial-gradient(ellipse at 72% 28%, rgba(91,143,255,0.2), transparent 55%), linear-gradient(180deg, #060b1c 0%, #04070f 100%)",
      ink: "#e6edff",
    },
    details: {
      role: "Designer & Developer",
      problem:
        "Autonomous agents operate as black boxes. Making invisible computation visible requires interfaces where thought becomes nodes, memory becomes structure, and complexity becomes clarity.",
      built:
        "Interactive graph of multi-agent routing. Real-time task pipeline with typed orchestration. Simulated telemetry that shows the architecture without exposing private context.",
      stack: ["React 19", "TypeScript", "SVG / Canvas", "Motion"],
    },
  },
  {
    id: "aura",
    index: "04",
    title: "Aura Pay",
    meaning: "Digital money with physical weight.",
    subtitle:
      "A spatial finance concept: a titanium card, biometric settlement in one gesture, and yield that routes itself — trust you can feel.",
    tags: ["FinTech Concept", "Spatial UI", "Product Design"],
    year: "2026",
    status: "Interactive prototype",
    brand: {
      accent: "#a78bfa",
      accentSoft: "rgba(167,139,250,0.16)",
      background:
        "radial-gradient(ellipse at 30% 62%, rgba(167,139,250,0.2), transparent 55%), linear-gradient(180deg, #0a0812 0%, #050408 100%)",
      ink: "#efeaff",
    },
    details: {
      role: "Product Designer",
      problem:
        "Digital finance feels weightless. How do you make trust tactile and make an instant transaction feel intentional?",
      built:
        "Interactive prototype of a spatial finance interface: a physical-feeling card, biometric settlement flow, dynamic currency switching and a spending model.",
      stack: ["React 19", "TypeScript", "SVG", "Motion"],
    },
  },
];

/* ── 01 · KachaniOS — ask the agent, watch it think ─────────────────── */

const AGENT_NODES = [
  { id: "plan", label: "Plan", x: 78, y: 62, color: "#818cf8" },
  { id: "vault", label: "Vault", x: 322, y: 62, color: "#22d3ee" },
  { id: "kernel", label: "Kernel", x: 200, y: 132, color: "#7fa5ff" },
  { id: "run", label: "Run", x: 78, y: 202, color: "#c084fc" },
  { id: "judge", label: "Judge", x: 322, y: 202, color: "#34d399" },
] as const;

type AgentNodeId = (typeof AGENT_NODES)[number]["id"];

const AGENT_EDGES: [AgentNodeId, AgentNodeId][] = [
  ["plan", "kernel"],
  ["vault", "kernel"],
  ["kernel", "run"],
  ["kernel", "judge"],
  ["plan", "vault"],
  ["run", "judge"],
];

const AGENT_PROMPTS = [
  {
    label: "Audit the auth flow",
    route: ["plan", "kernel", "run", "judge"] as AgentNodeId[],
    lines: [
      "Decomposed into four verifiable steps.",
      "Routed to the security auditor with typed context.",
      "Sandboxed scan across /app — zero secrets exposed.",
      "Verified. Handoff ready.",
    ],
  },
  {
    label: "Recall the project context",
    route: ["plan", "vault", "kernel", "judge"] as AgentNodeId[],
    lines: [
      "Question framed: multilingual routing decisions.",
      "Three sessions of structured memory retrieved.",
      "Context merged and typed for the next agent.",
      "Consistent with prior intent. Ready.",
    ],
  },
  {
    label: "Optimize the build",
    route: ["plan", "kernel", "judge"] as AgentNodeId[],
    lines: [
      "Dependency graph mapped: routes, motion, state.",
      "Visual overhead reduced, motion preserved.",
      "Benchmarked for predictable frame times. Pass.",
    ],
  },
];

function edgePath(a: AgentNodeId, b: AgentNodeId) {
  const from = AGENT_NODES.find((node) => node.id === a)!;
  const to = AGENT_NODES.find((node) => node.id === b)!;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bow = 14;
  return `M ${from.x} ${from.y} Q ${mx + (dy / length) * bow} ${my - (dx / length) * bow} ${to.x} ${to.y}`;
}

function KachaniosShowcase({ brand }: { brand: Brand }) {
  const reduceMotion = useReducedMotionPreference();
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hostRef, { once: true, amount: 0.45 });
  const [prompt, setPrompt] = useState(0);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  const run = (index: number) => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPrompt(index);
    setRunning(true);
    const total = AGENT_PROMPTS[index].lines.length;
    if (reduceMotion) {
      setStep(total);
      setRunning(false);
      return;
    }
    setStep(0);
    for (let i = 1; i <= total; i += 1) {
      timers.current.push(
        window.setTimeout(() => {
          setStep(i);
          if (i === total) setRunning(false);
        }, 420 + i * 620),
      );
    }
  };

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    run(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const active = AGENT_PROMPTS[prompt];
  const reached = new Set(active.route.slice(0, Math.min(step + 1, active.route.length)));
  const litEdges = new Set<string>();
  for (let i = 0; i < Math.min(step, active.route.length - 1); i += 1) {
    litEdges.add(`${active.route[i]}-${active.route[i + 1]}`);
    litEdges.add(`${active.route[i + 1]}-${active.route[i]}`);
  }

  return (
    <div
      ref={hostRef}
      className="relative min-h-[460px] overflow-hidden rounded-[1.75rem] border border-white/10 sm:min-h-[540px]"
      style={{ background: "linear-gradient(180deg, #071022 0%, #040816 100%)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(91,143,255,0.22), transparent 42%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 text-[0.65rem] tracking-[0.2em] uppercase text-white/45 sm:px-7">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full" style={{ background: brand.accent }} />
          kachani.os
        </span>
        <span aria-live="polite">{running ? "thinking…" : "idle"}</span>
      </div>

      <svg viewBox="0 0 400 264" className="absolute inset-x-0 top-10 mx-auto h-[52%] w-full sm:top-12">
        {AGENT_EDGES.map(([a, b]) => {
          const lit = litEdges.has(`${a}-${b}`);
          const d = edgePath(a, b);
          return (
            <g key={`${a}-${b}`}>
              <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.2} />
              <motion.path
                d={d}
                fill="none"
                stroke={brand.accent}
                strokeWidth={2.2}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 0.9 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }}
                style={{ filter: "drop-shadow(0 0 6px rgba(127,165,255,0.8))" }}
              />
            </g>
          );
        })}
        {AGENT_NODES.map((node) => {
          const lit = reached.has(node.id);
          const isKernel = node.id === "kernel";
          const radius = isKernel ? 30 : 19;
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={radius + 10}
                fill={node.color}
                initial={false}
                animate={{ opacity: lit ? 0.16 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill="#070f24"
                stroke={node.color}
                initial={false}
                animate={{ strokeWidth: lit ? 2.4 : 1.2, opacity: lit ? 1 : 0.55 }}
                transition={{ duration: 0.3 }}
              />
              {isKernel && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={16}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 14, ease: "linear", repeat: Infinity }}
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                />
              )}
              <text
                x={node.x}
                y={node.y + (isKernel ? 1 : 0.5)}
                textAnchor="middle"
                dominantBaseline="central"
                fill={lit ? "#ffffff" : node.color}
                fontSize={isKernel ? 12 : 10}
                fontWeight={600}
                letterSpacing="0.08em"
                className="select-none uppercase"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-5 pb-5 pt-6 sm:px-7 sm:pb-7"
        style={{ background: "linear-gradient(180deg, transparent, rgba(4,8,22,0.92) 30%)" }}>
        <div className="min-h-[5.5rem] space-y-1.5" aria-live="polite">
          <AnimatePresence initial={false}>
            {active.lines.slice(0, step).map((line, i) => (
              <motion.p
                key={`${prompt}-${i}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="text-sm leading-relaxed sm:text-[0.95rem]"
                style={{ color: i === active.lines.length - 1 ? brand.accent : "rgba(230,237,255,0.82)" }}
              >
                <span className="mr-2 font-semibold uppercase tracking-[0.16em] text-white/40 text-[0.62rem]">
                  {active.route[Math.min(i, active.route.length - 1)]}
                </span>
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap gap-2">
          {AGENT_PROMPTS.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={prompt === index}
              onClick={() => run(index)}
              className="rounded-full border px-4 py-2 text-xs font-medium transition-colors"
              style={
                prompt === index
                  ? { background: brand.accentSoft, borderColor: brand.accent, color: "#fff" }
                  : { borderColor: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.6)" }
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 02 · FICAM — scan a screening, earn the XP, level up ─────────────── */

const FICAM_LEVELS = [
  { name: "Spectateur", at: 0 },
  { name: "Cinéphile", at: 100 },
  { name: "Critique", at: 200 },
  { name: "Juré", at: 300 },
  { name: "Palme d'or", at: 400 },
];

const FICAM_SESSIONS = [
  { title: "Court-métrage", room: "Salle Atlas", time: "14:30" },
  { title: "Avant-première", room: "Grand Théâtre", time: "18:00" },
  { title: "Masterclass", room: "Salle 2", time: "11:00" },
  { title: "Film d'animation", room: "Salle 1", time: "16:15" },
];

const FICAM_START_XP = 130;
const FICAM_REWARD = 50;
const FICAM_GRADIENT = "linear-gradient(135deg, #9333ea 0%, #db2777 100%)";

function ficamLevel(xp: number) {
  let index = 0;
  FICAM_LEVELS.forEach((level, levelIndex) => {
    if (xp >= level.at) index = levelIndex;
  });
  return index;
}

/** A deterministic, QR-like matrix: three finder squares plus seeded modules. */
function createTicketCode(seed: number) {
  const size = 21;
  let state = seed * 9301 + 49297;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  const cells: [number, number][] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (inFinder(x, y)) continue;
      if (random() > 0.52) cells.push([x, y]);
    }
  }
  return { size, cells };
}

function FinderSquare({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={7} height={7} rx={1.2} fill="#0b0613" />
      <rect x={1} y={1} width={5} height={5} rx={0.8} fill="#fff" />
      <rect x={2} y={2} width={3} height={3} rx={0.6} fill="#0b0613" />
    </g>
  );
}

const SCAN_CORNERS = [
  "left-1 top-1 border-l-2 border-t-2",
  "right-1 top-1 border-r-2 border-t-2",
  "bottom-1 left-1 border-b-2 border-l-2",
  "bottom-1 right-1 border-b-2 border-r-2",
];

function FicamShowcase({ project }: { project: Project }) {
  const reduceMotion = useReducedMotionPreference();
  const [xp, setXp] = useState(FICAM_START_XP);
  const [session, setSession] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scanning" | "rewarded">("idle");
  const [levelUp, setLevelUp] = useState(false);
  const code = createTicketCode(session + 3);
  const levelIndex = ficamLevel(xp);
  const level = FICAM_LEVELS[levelIndex];
  const nextLevel = FICAM_LEVELS[levelIndex + 1];
  const levelProgress = nextLevel ? (xp - level.at) / (nextLevel.at - level.at) : 1;
  const current = FICAM_SESSIONS[session % FICAM_SESSIONS.length];

  useEffect(() => {
    if (phase !== "scanning") return;
    const timer = window.setTimeout(
      () => {
        setLevelUp(ficamLevel(xp + FICAM_REWARD) > ficamLevel(xp));
        setXp(xp + FICAM_REWARD);
        setPhase("rewarded");
        try {
          navigator.vibrate?.(12);
        } catch {
          // Vibration is a nicety; some browsers refuse it.
        }
      },
      reduceMotion ? 150 : 1300,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reduceMotion, xp]);

  const onAction = () => {
    if (phase === "scanning") return;
    if (phase === "rewarded") {
      if (!nextLevel) setXp(FICAM_START_XP);
      setSession((value) => value + 1);
      setLevelUp(false);
      setPhase("idle");
      return;
    }
    setPhase("scanning");
  };

  let status = "Présentez votre billet à l'entrée";
  if (phase === "scanning") status = "Lecture du billet…";
  else if (phase === "rewarded") {
    if (levelUp) status = `Niveau supérieur · ${level.name}`;
    else if (!nextLevel) status = "Festival terminé · niveau max";
    else status = `Encore ${nextLevel.at - xp} XP pour ${nextLevel.name}`;
  }

  let action = "Scanner la séance";
  if (phase === "scanning") action = "Scan en cours…";
  else if (phase === "rewarded") action = nextLevel ? "Séance suivante" : "Recommencer le festival";

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] border border-white/10 px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7"
      style={{ background: "linear-gradient(180deg, #120a24 0%, #08050f 100%)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 52%, rgba(168,85,247,0.34), transparent 45%), radial-gradient(circle at 15% 12%, rgba(219,39,119,0.16), transparent 35%)",
        }}
      />

      <div className="relative flex items-center justify-between gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em]">
        <span className="rounded-full px-3 py-1 text-white" style={{ background: FICAM_GRADIENT }}>
          Live app
        </span>
        <span className="text-right text-white/45">Try the scan flow</span>
      </div>

      {/* The phone: a native rebuild of the app's scan-and-reward flow. */}
      <div className="relative mx-auto mt-6 w-full max-w-[272px]">
        <div
          aria-hidden="true"
          className="absolute -inset-5 rounded-[3rem] opacity-60 blur-2xl"
          style={{ background: "linear-gradient(135deg, rgba(147,51,234,0.5), rgba(219,39,119,0.3))" }}
        />
        <div className="relative overflow-hidden rounded-[2.4rem] border-[6px] border-[#1a1424] bg-[#0b0613] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          <div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 30%, rgba(147,51,234,0.3), transparent 60%)" }}
          />

          <div className="relative flex flex-col px-4 pb-5 pt-9">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg" style={{ background: FICAM_GRADIENT }}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="white" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
                  </svg>
                </span>
                <span className="text-sm font-extrabold tracking-tight text-white">FICAM</span>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[0.6rem] font-semibold text-white/85">
                Niv. {levelIndex + 1}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between text-[0.62rem]">
                <span className="font-semibold text-white">{level.name}</span>
                <span className="font-mono text-white/55">
                  {nextLevel ? `${xp} / ${nextLevel.at} XP` : `${xp} XP · max`}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: FICAM_GRADIENT }}
                  initial={false}
                  animate={{ width: `${Math.max(4, levelProgress * 100)}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
                />
              </div>
            </div>

            <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.18em] text-fuchsia-300/80">Séance · {current.time}</p>
                  <p className="mt-0.5 text-[0.8rem] font-bold text-white">{current.title}</p>
                  <p className="text-[0.6rem] text-white/50">{current.room}</p>
                </div>
                <span className="font-mono text-[0.55rem] text-white/35">#{String(session + 4).padStart(3, "0")}</span>
              </div>

              <div className="relative mx-auto mt-3 aspect-square w-[62%] overflow-hidden rounded-xl bg-white p-2">
                <svg viewBox={`0 0 ${code.size} ${code.size}`} className="size-full" aria-label="Screening ticket code" role="img">
                  {code.cells.map(([x, y]) => (
                    <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0b0613" />
                  ))}
                  <FinderSquare x={0} y={0} />
                  <FinderSquare x={code.size - 7} y={0} />
                  <FinderSquare x={0} y={code.size - 7} />
                </svg>

                {phase === "scanning" && (
                  <div aria-hidden="true" className="absolute inset-0">
                    {SCAN_CORNERS.map((corner) => (
                      <span key={corner} className={`absolute size-4 rounded-sm border-fuchsia-500 ${corner}`} />
                    ))}
                    {!reduceMotion && (
                      <motion.div
                        className="absolute inset-x-1 h-0.5 rounded-full bg-fuchsia-500 shadow-[0_0_14px_4px_rgba(217,70,239,0.6)]"
                        initial={{ top: "6%" }}
                        animate={{ top: ["6%", "92%", "6%"] }}
                        transition={{ duration: 1.3, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {phase === "rewarded" && (
                    <motion.div
                      key="validated"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0613]/85"
                    >
                      <motion.span
                        initial={{ scale: 0.4 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 16 }}
                        className="flex size-10 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-black"
                      >
                        ✓
                      </motion.span>
                      <span className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                        Séance validée
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {phase === "rewarded" && (
                  <motion.span
                    key={`xp-${xp}`}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    className="absolute -right-1 -top-2 rounded-lg border border-emerald-400/40 bg-[#062014] px-2 py-1 text-[0.62rem] font-bold text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.35)]"
                  >
                    +{FICAM_REWARD} XP
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p aria-live="polite" className="mt-3 min-h-4 text-center text-[0.62rem] font-semibold text-fuchsia-200">
              {status}
            </p>

            <button
              type="button"
              onClick={onAction}
              disabled={phase === "scanning"}
              className="mt-3 w-full rounded-xl bg-white py-2.5 text-[0.72rem] font-bold text-[#12081f] shadow-[0_0_24px_rgba(217,70,239,0.35)] transition-transform active:scale-[0.97] disabled:opacity-70"
            >
              {action}
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-4 text-[0.62rem] uppercase tracking-[0.2em]">
        <span className="text-white/45">QR validation · XP · levels</span>
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-white transition-transform duration-300 hover:translate-x-0.5"
        >
          Open the real app ↗
        </a>
      </div>
    </div>
  );
}

/* ── 03 · Yalla China — the seven-step route, Morocco → campus ────────── */

const YALLA_STEPS = [
  { label: "Consultation", detail: "Un premier échange clair avec la famille." },
  { label: "Orientation", detail: "L'université et la ville qui correspondent au profil." },
  { label: "Dossier", detail: "Documents vérifiés, traductions préparées." },
  { label: "Admission", detail: "La candidature devient réelle et suivie." },
  { label: "Visa", detail: "Rendez-vous, délais et démarches organisés." },
  { label: "Préparation", detail: "Billet, briefing famille, support WhatsApp." },
  { label: "Arrivée", detail: "Accueil, transfert et premiers repères sur le campus." },
];

const YALLA_CITIES = ["Chongqing", "Nanchang", "Ningbo", "Harbin", "Xi'an", "Chengdu"];

function YallaChinaShowcase({ project }: { project: Project }) {
  const reduceMotion = useReducedMotionPreference();
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hostRef, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused || reduceMotion) return;
    const interval = window.setInterval(
      () => setActive((current) => (current + 1) % YALLA_STEPS.length),
      2200,
    );
    return () => window.clearInterval(interval);
  }, [inView, paused, reduceMotion]);

  const progress = active / (YALLA_STEPS.length - 1);

  return (
    <div
      ref={hostRef}
      className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[1.75rem] border border-[#f0b64a]/20 sm:min-h-[600px]"
      style={{ background: "linear-gradient(180deg, #23090c 0%, #120405 100%)" }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="view"
        aria-label="Open the live Yalla China platform"
        className="group relative block flex-1 overflow-hidden"
      >
        <Image
          src="/media/yallachina-preview.webp"
          alt="Yalla China website hero"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(35,9,12,0.1) 0%, rgba(35,9,12,0.15) 55%, rgba(35,9,12,0.95) 100%)",
          }}
        />
        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-[#f0b64a]/40 bg-[#1a0709]/70 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#f0b64a] backdrop-blur-md sm:left-8 sm:top-8">
          <span className="size-1.5 rounded-full bg-[#f0b64a]" />
          Live · FR / EN / AR
        </div>
        <span className="absolute right-6 top-7 text-[0.65rem] uppercase tracking-[0.2em] text-white/70 transition-transform duration-500 group-hover:translate-x-1 sm:right-8 sm:top-9">
          Open ↗
        </span>
      </a>

      <div className="relative px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
        <div className="mb-4 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.2em] text-[#f0b64a]/80">
          <span>Maroc → Campus en Chine</span>
          <span className="text-white/45">
            Étape {String(active + 1).padStart(2, "0")} / 07
          </span>
        </div>

        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
          <motion.div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 origin-left"
            style={{ background: "linear-gradient(90deg, #f0b64a, #d9333f)", width: "100%" }}
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE }}
          />
          <div className="absolute inset-0 flex items-center justify-between">
            {YALLA_STEPS.map((stepItem, index) => {
              const done = index <= active;
              return (
                <button
                  key={stepItem.label}
                  type="button"
                  aria-pressed={index === active}
                  aria-label={`Étape ${index + 1}: ${stepItem.label}`}
                  onClick={() => setActive(index)}
                  className="relative flex size-8 items-center justify-center"
                >
                  <motion.span
                    className="block rounded-full border"
                    initial={false}
                    animate={{
                      width: index === active ? 18 : 10,
                      height: index === active ? 18 : 10,
                      backgroundColor: done ? "#f0b64a" : "#2a0a0c",
                      borderColor: index === active ? "#d9333f" : done ? "#f0b64a" : "rgba(255,255,255,0.25)",
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 min-h-[3.6rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="display text-2xl text-[#fff1dc] sm:text-3xl">{YALLA_STEPS[active].label}</p>
              <p className="mt-1 text-sm text-white/65">{YALLA_STEPS[active].detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {YALLA_CITIES.map((city) => (
            <span
              key={city}
              className="rounded-full border border-[#f0b64a]/25 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-[#f0b64a]/80"
            >
              {city}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 04 · Aura Pay — one gesture: tap, Face ID, settled ──────────────── */

const AURA_BALANCE = 142850.75;
const AURA_AMOUNT = 48;

function formatEuro(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function AuraPayShowcase({ brand }: { brand: Brand }) {
  const reduceMotion = useReducedMotionPreference();
  const [phase, setPhase] = useState<"idle" | "scanning" | "settled">("idle");
  const [payments, setPayments] = useState(0);
  const timers = useRef<number[]>([]);
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });
  const [sheen, setSheen] = useState<CSSProperties>({});

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 14);
    rotateY.set((px - 0.5) * 18);
    setSheen({ "--mx": `${(px * 100).toFixed(1)}%`, "--my": `${(py * 100).toFixed(1)}%` } as CSSProperties);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const pay = () => {
    if (phase !== "idle") return;
    timers.current.forEach(window.clearTimeout);
    setPhase("scanning");
    const scanMs = reduceMotion ? 150 : 1100;
    timers.current = [
      window.setTimeout(() => {
        setPhase("settled");
        setPayments((count) => count + 1);
      }, scanMs),
      window.setTimeout(() => setPhase("idle"), scanMs + 2200),
    ];
  };

  const balance = AURA_BALANCE - payments * AURA_AMOUNT;

  return (
    <div
      className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 px-6 py-10 sm:min-h-[600px]"
      style={{ background: "linear-gradient(180deg, #0f0b1c 0%, #06040b 100%)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(167,139,250,0.24), transparent 45%)",
        }}
      />

      <div className="relative mb-6 text-center">
        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Balance</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={payments}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="display mt-1 text-3xl tabular-nums text-white sm:text-4xl"
          >
            {formatEuro(balance)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative w-full max-w-[460px]" style={{ perspective: 1200 }}>
        <motion.div
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...sheen }}
          animate={
            phase === "settled" && !reduceMotion
              ? { y: [0, 8, 0], scale: [1, 0.982, 1] }
              : { y: 0, scale: 1 }
          }
          transition={{ duration: 0.55, ease: EASE }}
          className="relative aspect-[1.586] w-full select-none rounded-[1.4rem] border border-white/12 shadow-[0_50px_90px_rgba(0,0,0,0.65)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[1.4rem]"
            style={{
              background:
                "linear-gradient(135deg, #2a2a38 0%, #15151d 38%, #0e0e14 62%, #23232f 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[1.4rem] opacity-80 mix-blend-screen"
            style={{
              background:
                "radial-gradient(420px circle at var(--mx, 30%) var(--my, 30%), rgba(255,255,255,0.16), transparent 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[1.4rem] opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)",
            }}
          />

          <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
            <div className="flex items-start justify-between">
              <span className="display text-xl tracking-tight text-white sm:text-2xl">
                Aura<span style={{ color: brand.accent }}>.</span>
              </span>
              <svg viewBox="0 0 24 24" className="size-6 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M6 8.5a6 6 0 0 1 0 7" />
                <path d="M9.5 6a10 10 0 0 1 0 12" />
                <path d="M13 3.5a14 14 0 0 1 0 17" />
              </svg>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-3">
                <div
                  aria-hidden="true"
                  className="h-8 w-11 rounded-md border border-[#e5c07b]/60"
                  style={{ background: "linear-gradient(135deg, #f1d28a, #b8873b 55%, #e8c37a)" }}
                >
                  <div className="mx-auto mt-2.5 h-px w-8 bg-[#5a3d12]/50" />
                  <div className="mx-auto mt-1 h-px w-8 bg-[#5a3d12]/50" />
                </div>
                <p className="font-mono text-sm tracking-[0.28em] text-white/85 sm:text-base">
                  •••• •••• •••• 8824
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/40">Titanium</p>
                <p className="mt-1 text-xs font-medium tracking-[0.18em] text-white/85">A. KACHANI</p>
                <p className="mt-0.5 font-mono text-[0.65rem] text-white/50">09 / 29</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {phase !== "idle" && (
              <motion.div
                key="faceid"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-0 flex items-center justify-center rounded-[1.4rem] bg-[#06040b]/55 backdrop-blur-[3px]"
              >
                <svg viewBox="0 0 120 120" className="size-28" aria-hidden="true">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={phase === "settled" ? "#34d399" : brand.accent}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduceMotion ? 0 : 1, ease: "easeInOut" }}
                    style={{ rotate: -90, transformOrigin: "60px 60px" }}
                  />
                  {phase === "scanning" ? (
                    <g stroke={brand.accent} strokeWidth="2.5" strokeLinecap="round" fill="none">
                      <path d="M42 40 v-6 a6 6 0 0 1 6 -6 h6" />
                      <path d="M78 40 v-6 a6 6 0 0 0 -6 -6 h-6" />
                      <path d="M42 80 v6 a6 6 0 0 0 6 6 h6" />
                      <path d="M78 80 v6 a6 6 0 0 1 -6 6 h-6" />
                      <path d="M52 55 v4" />
                      <path d="M68 55 v4" />
                      <path d="M60 54 v10 h-3" />
                      <path d="M51 70 q9 7 18 0" />
                    </g>
                  ) : (
                    <motion.path
                      d="M42 61 l12 12 l24 -26"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
                    />
                  )}
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="relative mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={pay}
          disabled={phase !== "idle"}
          className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] disabled:cursor-default disabled:opacity-80"
          style={{
            background: `linear-gradient(90deg, ${brand.accent}, #6d5bd6)`,
            boxShadow: "0 18px 40px rgba(167,139,250,0.28)",
          }}
        >
          {phase === "scanning"
            ? "Authorizing with Face ID…"
            : phase === "settled"
              ? `${formatEuro(AURA_AMOUNT)} settled`
              : `Tap to pay ${formatEuro(AURA_AMOUNT)}`}
        </button>
        <p aria-live="polite" className="text-[0.62rem] uppercase tracking-[0.22em] text-white/40">
          {phase === "settled" ? "Instant settlement · 4 ms" : "Biometric · one gesture"}
        </p>
      </div>
    </div>
  );
}

/* ── Project band ────────────────────────────────────────────────────── */

function Showcase({ project }: { project: Project }) {
  switch (project.id) {
    case "kachanios":
      return <KachaniosShowcase brand={project.brand} />;
    case "ficam":
      return <FicamShowcase project={project} />;
    case "yalla":
      return <YallaChinaShowcase project={project} />;
    case "aura":
      return <AuraPayShowcase brand={project.brand} />;
  }
}

function ProjectBand({ project, flip }: { project: Project; flip: boolean }) {
  const [showDetails, setShowDetails] = useState(false);
  const { brand } = project;

  return (
    <article
      id={`project-${project.id}`}
      className="relative -mx-6 px-6 py-20 sm:-mx-12 sm:px-12 sm:py-28"
      style={{ background: brand.background, color: brand.ink }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" aria-hidden="true" />
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
          <Reveal>
            <div className="flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.22em]" style={{ color: brand.accent }}>
              <span className="serif text-xl italic normal-case tracking-normal">{project.index}</span>
              <span className="h-px w-8" style={{ background: brand.accent, opacity: 0.6 }} />
              <span>{project.year}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">{project.status}</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="display mt-6 text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.98] tracking-[-0.02em]">
              {project.title}
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="serif mt-4 text-xl italic sm:text-2xl" style={{ color: brand.accent }}>
              {project.meaning}
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70">{project.subtitle}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em]"
                  style={{ borderColor: `${brand.accent}55`, color: brand.accent, background: brand.accentSoft }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium transition-transform duration-300 hover:translate-x-0.5"
                  style={{ color: brand.accent }}
                >
                  Visit live platform <span aria-hidden="true">↗</span>
                </a>
              )}
              {project.sourceHref && (
                <a
                  href={project.sourceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-white"
                >
                  Source <span aria-hidden="true">↗</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setShowDetails((open) => !open)}
                aria-expanded={showDetails}
                aria-controls={`project-${project.id}-details`}
                className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-white"
              >
                {showDetails ? "Hide the story" : "Read the story"}
                <span aria-hidden="true" className={`transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}>↓</span>
              </button>
            </div>
          </Reveal>

          <AnimatePresence initial={false}>
            {showDetails && (
              <motion.div
                id={`project-${project.id}-details`}
                key="details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-8 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">My role</p>
                    <p className="mt-2 text-sm text-white/85">{project.details.role}</p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">Stack</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.details.stack.map((tech) => (
                        <span key={tech} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[0.65rem] text-white/75">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">Problem</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{project.details.problem}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">What I built</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{project.details.built}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
          <Reveal delay={0.1} y={40}>
            <Showcase project={project} />
          </Reveal>
        </div>
      </div>
    </article>
  );
}

export default function WorkSection() {
  return (
    <section id="work" className="relative px-6 pt-24 sm:px-12 sm:pt-36">
      <span aria-hidden="true" className="ghost-numeral">
        01
      </span>
      <span
        aria-hidden="true"
        className="edge-label label-caps absolute left-3 top-40 hidden text-faint lg:block"
      >
        Selected Work — 2024 / 2026
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

      <Reveal delay={0.12}>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Four products, four worlds. Each one keeps its own identity here — and
          each one you can touch.
        </p>
      </Reveal>

      <div className="mt-20">
        {PROJECTS.map((project, index) => (
          <ProjectBand key={project.id} project={project} flip={index % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
