"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useSpring } from "motion/react";
import { Reveal } from "./Marquee";

import { EASE_OUT as EASE } from "./tokens";
import { useReducedMotionPreference } from "./use-reduced-motion";

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
  sourceHref?: string;
  live?: boolean;
  image?: string;
  details?: {
    role: string;
    problem: string;
    built: string;
    stack: string[];
  };
};

const PROJECTS: Project[] = [
  {
    index: "01",
    title: "KachaniOS",
    subtitle:
      "Designing the interface for a self-evolving AI agent — neural graph architecture, AST inspection and autonomous cognition.",
    tags: ["Product UX", "AI Interfaces", "Desktop OS"],
    year: "2026",
    tone: "from-[#0a1128] via-[#0e1738] to-[#060b18]",
    cursorBg: "linear-gradient(135deg, #0a1128 0%, #1c2b5e 65%, #5b8fff 140%)",
    live: false,
    details: {
      role: "Designer & Developer",
      problem: "Autonomous agents operate as black boxes. Making invisible computation visible requires designing interfaces where thought becomes nodes, memory becomes structure, and complexity becomes clarity.",
      built: "Interactive DAG visualization of multi-agent routing. Real-time task execution pipeline with typed orchestration. Simulated agent telemetry showing architectural patterns (multi-agent routing, typed handoff, privacy-safe public architecture).",
      stack: ["React 19", "TypeScript", "SVG/Canvas", "Motion/Framer"],
    },
  },
  {
    index: "02",
    title: "FICAM Festival Platform",
    subtitle:
      "Full-stack festival companion application — student registration, QR-code verification, gamified progression and reward system.",
    tags: ["Next.js", "Full-Stack", "Supabase"],
    year: "2024",
    tone: "from-[#0c1433] via-[#1a2856] to-[#070a18]",
    cursorBg: "linear-gradient(135deg, #0c1433 0%, #1f3a6b 60%, #5b8fff 135%)",
    href: "https://ficam-festival-final.vercel.app",
    sourceHref: "https://github.com/kachaniabdellah86/ficam-festival-app",
    live: true,
    details: {
      role: "Full-Stack Developer",
      problem: "Festival organizers needed a way to engage student participants, track attendance, validate film screenings, and reward engagement across multiple sessions.",
      built: "Student registration and authentication. QR-code scanning for session validation. Gamified progression system with badges and level unlocking. Real-time reward accumulation.",
      stack: ["Next.js", "TypeScript", "Supabase (PostgreSQL)", "Real-time Subscriptions"],
    },
  },
  {
    index: "03",
    title: "Aura Pay",
    subtitle:
      "Next-generation spatial finance & wealth OS — titanium cards, automated yield routing and instant biometric settlements.",
    tags: ["FinTech Concept", "Product Design", "Spatial UI"],
    year: "2026",
    tone: "from-[#140e28] via-[#1a1236] to-[#0a0718]",
    cursorBg: "linear-gradient(135deg, #140e28 0%, #301f5c 65%, #a855f7 140%)",
    live: false,
    details: {
      role: "Product Designer",
      problem: "Digital finance feels weightless. How do you make trust feel tactile? How do you make instantaneous transactions feel intentional?",
      built: "Interactive prototype of a spatial finance interface. Dynamic currency switching (USD/EUR/ETH). Real-time spending graph with monotone cubic interpolation. Biometric settlement flows.",
      stack: ["React 19", "TypeScript", "SVG Graphics", "Motion Animations"],
    },
  },
  {
    index: "04",
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
    details: {
      role: "Product Designer & Frontend Developer",
      problem: "Moroccan students and families needed clarity and trust around study abroad in China. Language and cultural distance created friction. Testimonials and social proof were missing.",
      built: "Fully internationalized web platform (French, English, Arabic, Darija). Right-to-left support for Arabic. Trust-centered UX with clear program pathways, FAQ, and decision support.",
      stack: ["Next.js", "TypeScript", "i18n-next", "Tailwind CSS"],
    },
  },
];

/* ── 1. KachaniOS — Interactive AI Agent Cognitive Sandbox ──────────────
 *  A real developer-tool-grade cockpit. One system-level animate-pulse
 *  on the status LED, everything else driven by React state transitions.
 *  The DAG uses a single SVG viewBox so node circles and edge lines
 *  share the same coordinate space — zero alignment drift.
 * ──────────────────────────────────────────────────────────────────── */
function KachaniosLiveEngine() {
  const reduceMotion = useReducedMotionPreference();
  const [activeTask, setActiveTask] = useState<"security" | "memory" | "optimizer">("security");
  const [selectedNode, setSelectedNode] = useState<string>("kernel");
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamIndex, setStreamIndex] = useState(4);
  const [runVersion, setRunVersion] = useState(0);

  const tasks = {
    security: {
      title: "Security & Auth AST Audit",
      target: "@security-auditor",
      telemetry: [
        { level: "KERNEL", msg: "Decomposed prompt → 'Verify zero Auth token leaks in Server Actions'", color: "text-[var(--accent)]" },
        { level: "AST", msg: "Parsed 48 TS AST nodes across /app/api — 0 unsafe sinks", color: "text-indigo-300" },
        { level: "CHECK", msg: "JWT HttpOnly ✓  SameSite=Strict ✓  Secure ✓  no-store ✓", color: "text-emerald-400" },
        { level: "PASS", msg: "Convergence loop complete · 0 vulnerabilities · 8ms", color: "text-amber-300" },
      ],
    },
    memory: {
      title: "Vector Memory Synthesis",
      target: "@memory-vault",
      telemetry: [
        { level: "QUERY", msg: "Semantic retrieval → 'GPU compositing & layer isolation'", color: "text-[var(--accent)]" },
        { level: "EMBED", msg: "Cosine 0.964 across 1,840 project vectors (1536-d)", color: "text-cyan-300" },
        { level: "MERGE", msg: "Cross-referenced @architect + @eval-judge vaults", color: "text-purple-300" },
        { level: "DONE", msg: "Durable handoff complete · ctx 14.2k / 200k tokens", color: "text-emerald-400" },
      ],
    },
    optimizer: {
      title: "Bundle & Tree-Shake Pass",
      target: "@code-architect",
      telemetry: [
        { level: "TRACE", msg: "Dependency graph → 312 modules, 18 dynamic imports", color: "text-indigo-300" },
        { level: "SHAKE", msg: "Promoted 24 static icons to SVG sprite sheet (−34 kB)", color: "text-amber-300" },
        { level: "BENCH", msg: "LCP 0.42 s · CLS 0.000 · GPU −18 MB peak", color: "text-[var(--accent)]" },
        { level: "PASS", msg: "Production build OK · 0 type errors · 120 FPS", color: "text-emerald-400" },
      ],
    },
  };

  /* ── SVG-native DAG — single viewBox, no CSS positioning ── */
  const dagNodes = [
    { id: "kernel",  label: "Kernel",  cx: 150, cy: 55, color: "#5b8fff" },
    { id: "planner", label: "Plan",    cx: 55,  cy: 20, color: "#818cf8" },
    { id: "vault",   label: "Vault",   cx: 245, cy: 20, color: "#22d3ee" },
    { id: "harness", label: "Run",     cx: 55,  cy: 90, color: "#c084fc" },
    { id: "judge",   label: "Judge",   cx: 245, cy: 90, color: "#34d399" },
  ];
  const dagEdges = [
    ["planner", "kernel"], ["vault", "kernel"],
    ["kernel", "harness"], ["kernel", "judge"],
    ["planner", "vault"],  ["harness", "judge"],
  ];
  const taskRoutes: Record<typeof activeTask, Set<string>> = {
    security: new Set(["planner-kernel", "kernel-harness", "harness-judge"]),
    memory: new Set(["planner-vault", "vault-kernel", "kernel-judge"]),
    optimizer: new Set(["planner-kernel", "kernel-judge"]),
  };
  const nodeMap = Object.fromEntries(dagNodes.map((n) => [n.id, n]));

  const nodeInfo: Record<string, { role: string; lat: string; desc: string }> = {
    kernel:  { role: "Orchestration Kernel",   lat: "1.2 ms", desc: "Autonomous loop controller & task-graph dispatcher" },
    planner: { role: "Planner & Decomposer",   lat: "3.4 ms", desc: "Breaks goals into verifiable machine-decidable steps" },
    vault:   { role: "1536-d Vector Memory",    lat: "2.1 ms", desc: "Embedding vault for cross-session knowledge" },
    harness: { role: "Sandboxed AST Runner",    lat: "4.8 ms", desc: "Zero-network sandbox & unit-test verifier" },
    judge:   { role: "Adversarial Verifier",    lat: "2.6 ms", desc: "Independent quality gate & 5-axis evaluator" },
  };

  useEffect(() => {
    if (runVersion === 0) return;

    if (reduceMotion) {
      const frame = requestAnimationFrame(() => {
        setStreamIndex(4);
        setIsExecuting(false);
      });
      return () => cancelAnimationFrame(frame);
    }

    const timers = [
      window.setTimeout(() => setStreamIndex(1), 60),
      window.setTimeout(() => setStreamIndex(2), 220),
      window.setTimeout(() => setStreamIndex(3), 440),
      window.setTimeout(() => {
        setStreamIndex(4);
        setIsExecuting(false);
      }, 700),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [reduceMotion, runVersion]);

  const runTask = (task: typeof activeTask) => {
    setActiveTask(task);
    setIsExecuting(true);
    setStreamIndex(reduceMotion ? 4 : 0);
    setRunVersion((version) => version + 1);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-3 sm:p-5 font-mono select-none pointer-events-auto bg-[#070b16]">
      {/* ── Chrome title-bar ── */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-[7px] rounded-full bg-[#ff5f57]" />
            <span className="size-[7px] rounded-full bg-[#febc2e]" />
            <span className="size-[7px] rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[0.6rem] sm:text-[0.7rem] font-semibold tracking-wider text-white/90">
            kachani.os<span className="text-white/30 font-normal hidden sm:inline"> — cognitive agent harness v2.4</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.5rem] text-emerald-400/90">
          <span className={`size-1.5 rounded-full bg-emerald-400 ${reduceMotion ? "" : "animate-pulse"}`} />
          <span className="hidden sm:inline">system nominal</span>
        </div>
      </div>

      {/* ── Pipeline selector ── */}
      <div className="flex items-center gap-2 py-2 border-b border-white/5 z-10 overflow-x-auto">
        {(["security", "memory", "optimizer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={activeTask === t}
            onClick={(e) => { e.stopPropagation(); runTask(t); }}
            className={`min-h-7 whitespace-nowrap rounded-md border px-2.5 py-1 text-[0.55rem] transition-colors cursor-pointer ${
              activeTask === t
                ? "bg-white/10 border-white/20 text-white font-semibold"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {t === "security" && "Security Audit"}
            {t === "memory"   && "Vector Vault"}
            {t === "optimizer" && "AST Optimizer"}
          </button>
        ))}
      </div>

      {/* ── Main split: terminal + DAG ── */}
      <div className="grid grid-cols-12 gap-2 flex-1 py-2 z-10 min-h-0">

        {/* Terminal */}
        <div className="col-span-7 flex min-w-0 flex-col bg-black/50 rounded-lg border border-white/8 p-2 sm:p-2.5 min-h-0">
          <div className="flex items-center justify-between text-[0.5rem] text-white/40 pb-1.5 border-b border-white/5">
            <span>{tasks[activeTask].target} <span className="text-white/20">→</span> {tasks[activeTask].title}</span>
            {isExecuting
              ? <span className="text-amber-400">running…</span>
              : <span className="text-emerald-400">done ✓</span>}
          </div>
          <div className="flex-1 flex flex-col justify-center gap-1 py-1.5">
            {tasks[activeTask].telemetry.slice(0, streamIndex).map((log, i) => (
              <motion.p
                key={`${activeTask}-${i}`}
                initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="truncate text-[0.5rem] leading-snug sm:text-[0.55rem]"
              >
                <span className={`font-semibold ${log.color}`}>[{log.level}]</span>{" "}
                <span className="text-white/70">{log.msg}</span>
              </motion.p>
            ))}
          </div>
          <div className="flex items-center justify-between text-[0.45rem] text-white/25 pt-1 border-t border-white/5">
            <span>ctx 14.2 k / 200 k</span>
            <span>latency 8 ms</span>
          </div>
        </div>

        {/* DAG — fully SVG, zero CSS alignment issues */}
        <div className="col-span-5 flex min-w-0 flex-col bg-black/40 rounded-lg border border-white/8 p-2 sm:p-2.5 min-h-0">
          <div className="flex items-center justify-between text-[0.5rem] text-white/40 pb-1.5 border-b border-white/5">
            <span>agent graph</span>
            <span className="text-white/60">{nodeInfo[selectedNode].lat}</span>
          </div>

          <svg viewBox="0 0 300 110" className="flex-1 w-full" style={{ minHeight: 64 }}>
            <defs>
              <linearGradient id="dag-flow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="55%" stopColor="#5b8fff" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            {/* Edges — quadratic beziers through kernel center for organic curves */}
            {dagEdges.map(([fromId, toId], i) => {
              const a = nodeMap[fromId], b = nodeMap[toId];
              const lit = selectedNode === fromId || selectedNode === toId;
              const routeActive = taskRoutes[activeTask].has(`${fromId}-${toId}`);
              /* Slight curve: control point offset perpendicular to midpoint */
              const mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2;
              const dx = b.cx - a.cx, dy = b.cy - a.cy;
              const off = 8; /* curve offset */
              const cx = mx + (dy / Math.hypot(dx, dy || 1)) * off;
              const cy2 = my - (dx / Math.hypot(dx, dy || 1)) * off;
              const path = `M ${a.cx} ${a.cy} Q ${cx} ${cy2} ${b.cx} ${b.cy}`;
              return (
                <g key={`${fromId}-${toId}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke={lit || routeActive ? "rgba(91,143,255,0.55)" : "rgba(255,255,255,0.1)"}
                    strokeWidth={lit ? 1.8 : routeActive ? 1.35 : 0.8}
                    className="transition-all duration-300"
                  />
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="url(#dag-flow)"
                    strokeWidth={routeActive ? 2 : 1}
                    strokeLinecap="round"
                    strokeDasharray="3 10"
                    initial={false}
                    animate={
                      isExecuting && routeActive && !reduceMotion
                        ? { strokeDashoffset: [0, -26], opacity: [0.25, 1, 0.25] }
                        : { strokeDashoffset: 0, opacity: routeActive ? 0.55 : 0 }
                    }
                    transition={
                      isExecuting && routeActive && !reduceMotion
                        ? { duration: 0.72, ease: "linear", repeat: Infinity, delay: i * 0.06 }
                        : { duration: 0.2 }
                    }
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {dagNodes.map((n) => {
              const sel = selectedNode === n.id;
              return (
                <g
                  key={n.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(n.id); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedNode(n.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${nodeInfo[n.id].role}`}
                  className="cursor-pointer"
                >
                  <circle cx={n.cx} cy={n.cy} r={20} fill="transparent" />
                  {/* Glow ring on selected */}
                  {sel && (
                    <circle cx={n.cx} cy={n.cy} r={16} fill="none"
                      stroke={n.color} strokeWidth={1} opacity={0.3} />
                  )}
                  <circle cx={n.cx} cy={n.cy} r={11}
                    fill={sel ? n.color : "#0d1225"}
                    stroke={n.color}
                    strokeWidth={sel ? 2 : 1}
                    opacity={sel ? 1 : 0.6}
                    className="transition-all duration-200"
                  />
                  <text x={n.cx} y={n.cy + 1} textAnchor="middle" dominantBaseline="central"
                    fill={sel ? "#fff" : n.color}
                    fontSize={8} fontWeight={600} fontFamily="monospace"
                    className="pointer-events-none select-none transition-all duration-200"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Inspector */}
          <div aria-live="polite" className="truncate text-[0.44rem] text-white/50 pt-1 border-t border-white/5 sm:text-[0.48rem]">
            <span className="text-white/80 font-semibold">{nodeInfo[selectedNode].role}</span>
            <span className="text-white/30"> — </span>
            <span>{nodeInfo[selectedNode].desc}</span>
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between border-t border-white/8 pt-2 text-[0.48rem] text-white/30 z-10">
        <span>multi-agent routing · typed orchestration</span>
        <span>architecture <span className="text-emerald-400/80">production-ready ✓</span></span>
      </div>
    </div>
  );
}

/* ── 2. Aura Pay — Spatial FinTech Mobile Prototype ────────────────────
 *  Clean financial UI. One subtle animate-pulse on the Dynamic Island
 *  status LED — nothing else animates permanently. The spending graph
 *  uses proper monotone cubic interpolation so curves flow naturally
 *  between data points instead of sharp kinks.
 * ──────────────────────────────────────────────────────────────────── */

/* Attempt a smooth monotone cubic spline. For each interior point we
 * compute tangent = (y[i+1] - y[i-1]) / 2 and build C commands.
 * Falls back to straight segments at endpoints. */
function smoothPath(xs: number[], ys: number[]): string {
  if (xs.length < 2) return "";
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const x0 = xs[i - 1], y0 = ys[i - 1];
    const x1 = xs[i], y1 = ys[i];
    const seg = (x1 - x0) / 3;
    /* Tangent at previous point */
    const t0 = i === 1 ? (y1 - y0) : (ys[i] - ys[i - 2]) / 2;
    /* Tangent at current point */
    const t1 = i === xs.length - 1 ? (y1 - y0) : (ys[i + 1] - ys[i - 1]) / 2;
    d += ` C ${x0 + seg} ${y0 + t0 / 3}, ${x1 - seg} ${y1 - t1 / 3}, ${x1} ${y1}`;
  }
  return d;
}

function AuraPayLiveSimulator() {
  const reduceMotion = useReducedMotionPreference();
  const [currency, setCurrency] = useState<"USD" | "EUR" | "ETH">("USD");
  const [isFrozen, setIsFrozen] = useState(false);
  const [faceIdState, setFaceIdState] = useState<"idle" | "scanning" | "verified">("idle");
  const [activeDayIndex, setActiveDayIndex] = useState(2);
  const [balanceAdjustmentUsd, setBalanceAdjustmentUsd] = useState(0);
  const [spendAdjustmentsUsd, setSpendAdjustmentsUsd] = useState<number[]>(() => Array(7).fill(0));
  const [pendingPaymentUsd, setPendingPaymentUsd] = useState<number | null>(null);
  const [lastPaymentUsd, setLastPaymentUsd] = useState<number | null>(null);
  const authTimers = useRef<number[]>([]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const xs = [25, 70, 115, 160, 205, 250, 295];

  const balanceUsd = 142850.75;
  const spendUsd = [320, 450, 1245, 680, 890, 210, 140];
  const baseChartYs = [38, 28, 12, 26, 18, 44, 48];
  const currencyRates = { USD: 1, EUR: 0.92, ETH: 0.0003 } as const;
  const rate = currencyRates[currency];
  const chartYs = baseChartYs.map((y, index) =>
    Math.max(7, y - Math.min(18, spendAdjustmentsUsd[index] / 8))
  );
  const splineD = smoothPath(xs, chartYs);
  const areaD = `${splineD} L ${xs[6]} 56 L ${xs[0]} 56 Z`;
  const activeSpend = (spendUsd[activeDayIndex] + spendAdjustmentsUsd[activeDayIndex]) * rate;
  const balance = (balanceUsd + balanceAdjustmentUsd) * rate;

  const formatAmount = (amount: number, precise = false) => {
    if (currency === "ETH") return `${amount.toFixed(2)} ETH`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: precise ? 2 : 0,
      maximumFractionDigits: precise ? 2 : 0,
    }).format(amount);
  };

  const clearAuthTimers = () => {
    authTimers.current.forEach(window.clearTimeout);
    authTimers.current = [];
  };

  useEffect(() => () => clearAuthTimers(), []);

  const settlePayment = (amountUsd: number | null, dayIndex: number) => {
    if (amountUsd === null) return;
    setBalanceAdjustmentUsd((current) => current - amountUsd);
    setSpendAdjustmentsUsd((current) =>
      current.map((amount, index) => index === dayIndex ? amount + amountUsd : amount)
    );
    setLastPaymentUsd(amountUsd);
  };

  const doFaceId = (amountUsd: number | null = null) => {
    if (faceIdState !== "idle" || (amountUsd !== null && isFrozen)) return;

    clearAuthTimers();
    const paymentDayIndex = activeDayIndex;
    setPendingPaymentUsd(amountUsd);
    setLastPaymentUsd(null);

    if (reduceMotion) {
      setFaceIdState("scanning");
      authTimers.current.push(
        window.setTimeout(() => {
          setFaceIdState("verified");
          settlePayment(amountUsd, paymentDayIndex);
        }, 200),
        window.setTimeout(() => {
          setFaceIdState("idle");
          setPendingPaymentUsd(null);
        }, 1600),
      );
      return;
    }

    setFaceIdState("scanning");
    authTimers.current.push(
      window.setTimeout(() => {
        setFaceIdState("verified");
        settlePayment(amountUsd, paymentDayIndex);
      }, 800),
      window.setTimeout(() => {
        setFaceIdState("idle");
        setPendingPaymentUsd(null);
      }, 2800),
    );
  };

  const islandLabel = faceIdState === "scanning"
    ? pendingPaymentUsd === null ? "Scanning Face…" : `Authorizing ${formatAmount(pendingPaymentUsd * rate)}…`
    : faceIdState === "verified"
      ? lastPaymentUsd === null ? "Face ID verified ✓" : `${formatAmount(lastPaymentUsd * rate)} settled ✓`
      : isFrozen ? "Card frozen" : "Aura Pay";

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-3 sm:p-5 font-mono select-none pointer-events-auto bg-[#0d0a1c]">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2 z-10">
        <div className="flex items-center gap-2 text-[0.55rem] text-white/50">
          <span className="font-semibold text-white/70">9:41</span>
          <span className="hidden sm:inline">5G</span>
        </div>

        {/* Dynamic Island */}
        <div aria-live="polite" className="flex max-w-[9rem] items-center gap-1.5 rounded-full bg-black/80 border border-white/10 px-2.5 py-0.5">
          <span className={`size-1.5 rounded-full ${
            faceIdState === "scanning" ? "bg-amber-400" : faceIdState === "verified" ? "bg-emerald-400" : isFrozen ? "bg-cyan-300" : "bg-violet-400"
          } ${reduceMotion ? "" : "animate-pulse"}`} />
          <span className="truncate text-[0.48rem] text-white/70 font-medium sm:text-[0.52rem]">{islandLabel}</span>
        </div>

        {/* Currency tabs */}
        <div className="flex rounded-md border border-white/10 bg-black/40 overflow-hidden">
          {(["USD", "EUR", "ETH"] as const).map((c) => (
            <button key={c} type="button"
              aria-pressed={currency === c}
              onClick={(e) => { e.stopPropagation(); setCurrency(c); }}
              className={`min-h-6 px-2 py-0.5 text-[0.48rem] uppercase tracking-wider cursor-pointer transition-colors ${
                currency === c ? "bg-violet-600 text-white font-semibold" : "text-white/35 hover:text-white/60"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ── Card + Chart ── */}
      <div className="grid grid-cols-12 gap-2 flex-1 py-2 z-10 min-h-0">

        {/* Titanium card */}
        <div className={`col-span-5 flex min-w-0 flex-col justify-between p-2 sm:p-3 rounded-xl border transition-colors duration-300 min-h-0 ${
          isFrozen
            ? "bg-[#0a1525] border-cyan-500/30"
            : "bg-gradient-to-br from-[#1e1040] to-[#12081e] border-white/10"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[0.5rem] uppercase tracking-widest font-bold text-violet-300/80">
              {isFrozen ? "❄ frozen" : "✦ titanium"}
            </span>
            <button type="button"
              onClick={(e) => { e.stopPropagation(); setIsFrozen(!isFrozen); }}
              disabled={faceIdState !== "idle"}
              className="min-h-6 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[0.45rem] text-white/60 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >{isFrozen ? "Unfreeze" : "Freeze"}</button>
          </div>

          <div className="my-auto py-1">
            <p className="text-[0.45rem] text-white/35 uppercase tracking-wider">Balance</p>
            <p className="truncate text-base font-bold tracking-tight text-white sm:text-xl">{formatAmount(balance, true)}</p>
          </div>

          <div className="flex items-center justify-between text-[0.48rem] text-white/30">
            <span>•••• 8824</span>
            <span className="text-violet-400/70">09 / 29</span>
          </div>
        </div>

        {/* Spending chart */}
        <div className="col-span-7 flex min-w-0 flex-col bg-black/40 rounded-lg border border-white/8 p-2 sm:p-2.5 min-h-0">
          <div className="flex items-center justify-between text-[0.48rem] text-white/40 pb-1.5 border-b border-white/5">
            <span>spending</span>
            <span aria-live="polite" className="text-violet-300 font-medium">
              {days[activeDayIndex]} · {formatAmount(activeSpend)}
            </span>
          </div>

          {/* SVG chart */}
          <svg viewBox="0 0 320 60" className="flex-1 w-full" style={{ minHeight: 50 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="ap-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="ap-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(168,85,247,0.18)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0)" />
              </linearGradient>
            </defs>
            <motion.path initial={false} d={areaD} animate={{ d: areaD }} transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }} fill="url(#ap-fill)" />
            <motion.path initial={false} d={splineD} animate={{ d: splineD }} transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }} fill="none" stroke="url(#ap-grad)" strokeWidth="2" strokeLinecap="round" />
            {/* Scrubber */}
            <motion.line initial={false} x1={xs[activeDayIndex]} y1={chartYs[activeDayIndex]} x2={xs[activeDayIndex]} animate={{ x1: xs[activeDayIndex], y1: chartYs[activeDayIndex], x2: xs[activeDayIndex] }} transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }} y2={56}
              stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" opacity={0.5} />
            <motion.circle initial={false} cx={xs[activeDayIndex]} cy={chartYs[activeDayIndex]} animate={{ cx: xs[activeDayIndex], cy: chartYs[activeDayIndex] }} transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }} r="5"
              fill="none" stroke="#a855f7" strokeWidth="1.5" opacity={0.4} />
            <motion.circle initial={false} cx={xs[activeDayIndex]} cy={chartYs[activeDayIndex]} animate={{ cx: xs[activeDayIndex], cy: chartYs[activeDayIndex] }} transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }} r="3"
              fill="#fff" stroke="#a855f7" strokeWidth="1.5" />
          </svg>

          {/* Day buttons */}
          <div className="flex justify-between pt-1 border-t border-white/5">
            {days.map((d, i) => (
              <button key={d} type="button"
                onClick={(e) => { e.stopPropagation(); setActiveDayIndex(i); }}
                aria-pressed={activeDayIndex === i}
                className={`min-h-6 min-w-6 rounded px-1.5 py-0.5 text-[0.48rem] cursor-pointer transition-colors ${
                  activeDayIndex === i
                    ? "text-violet-300 font-semibold bg-violet-500/15"
                    : "text-white/25 hover:text-white/50"
                }`}
              >{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between gap-1 border-t border-white/8 pt-2 text-[0.48rem] z-10">
        <button type="button"
          onClick={(e) => { e.stopPropagation(); doFaceId(null); }}
          disabled={faceIdState !== "idle"}
          className="flex min-h-7 items-center gap-1.5 text-white/40 transition-colors hover:text-white/60 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="2" width="10" height="12" rx="2" />
            <circle cx="8" cy="7" r="2" />
            <path d="M6 10.5 a2 2 0 0 1 4 0" />
          </svg>
          <span className="hidden sm:inline">{faceIdState === "verified" ? "Authorized ✓" : "Authenticate"}</span>
          <span className="sm:hidden">Face ID</span>
        </button>
        <div className="flex items-center gap-1">
          {[48, 120].map((amountUsd) => (
            <button
              key={amountUsd}
              type="button"
              disabled={isFrozen || faceIdState !== "idle"}
              onClick={(e) => { e.stopPropagation(); doFaceId(amountUsd); }}
              className="min-h-7 rounded border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-violet-200/80 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Pay {formatAmount(amountUsd * rate)}
            </button>
          ))}
        </div>
        <span className="hidden text-white/25 sm:inline">
          {lastPaymentUsd === null ? "secure settlement · 4 ms" : `${formatAmount(lastPaymentUsd * rate)} posted`}
        </span>
      </div>
    </div>
  );
}

/* ── Preview Panel ──────────────────────────────────────────────────── */
function ProjectPreview({ project }: { project: Project }) {
  return (
    <div
      id={`project-${project.index}-preview`}
      role="region"
      aria-label={`${project.title} ${project.live ? "live preview" : "interactive prototype"}`}
      tabIndex={-1}
      className={`relative h-[280px] sm:h-[340px] md:h-[380px] w-full overflow-hidden rounded-xl bg-gradient-to-br outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${project.tone}`}
    >
      {project.title === "KachaniOS" && <KachaniosLiveEngine />}
      {project.title === "Aura Pay" && <AuraPayLiveSimulator />}

      {project.image && (
        <div className="absolute inset-0 overflow-hidden">
          <Image src={project.image} alt={project.title} fill quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
            className="object-cover object-top opacity-95 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b18]/60 via-transparent to-transparent opacity-40 transition-opacity duration-700 group-hover:opacity-10" />
        </div>
      )}

      {/* Noise grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "200px 200px" }} />

      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(91,143,255,0.12) 0%, transparent 65%)" }} />
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(91,143,255,0.18), transparent 65%)" }} />

      {/* Badge */}
      {project.live && (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[rgba(91,143,255,0.18)] px-3 py-1 backdrop-blur-md">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          <span className="label-caps accent">Live ↗</span>
        </div>
      )}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────────────────── */
function Card({ project }: { project: Project }) {
  const reduce = useReducedMotionPreference();
  const tilt = useTilt(!reduce);
  const [showDetails, setShowDetails] = useState(false);

  const focusPrototype = () => {
    const preview = document.getElementById(`project-${project.index}-preview`);
    preview?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    preview?.focus({ preventScroll: true });
  };

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
        {/* Header */}
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
              {project.live ? "Live ↗" : "Interactive"}
            </p>
          </div>
        </div>

        {/* Preview */}
        {project.href ? (
          <motion.a href={project.href} target="_blank" rel="noopener noreferrer"
            className={previewClass} data-cursor="view" data-cursor-img={project.cursorBg} {...tilt}>
            <ProjectPreview project={project} />
          </motion.a>
        ) : (
          <motion.div className={previewClass} data-cursor="explore" data-cursor-img={project.cursorBg} {...tilt}>
            <ProjectPreview project={project} />
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-sm leading-relaxed text-muted">{project.subtitle}</p>
            <div className="inline-flex items-center gap-3 mt-2">
              {project.href ? (
                <a href={project.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline">
                  Visit live platform <span>↗</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={focusPrototype}
                  className="inline-flex items-center gap-1 text-xs font-medium text-white/50 transition-colors hover:text-white"
                >
                  Explore interactive prototype <span aria-hidden="true">↑</span>
                </button>
              )}
              {project.details && (
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-white/50 transition-colors hover:text-white"
                  aria-expanded={showDetails}
                  aria-label={`${showDetails ? "Hide" : "Show"} project details`}
                >
                  {showDetails ? "Hide" : "Show"} details
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag}
                className="rounded-full border border-[var(--hairline)] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Project Details */}
        {project.details && showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 grid gap-4 border-t border-white/8 pt-6"
          >
            <div>
              <p className="label-caps text-white/50 mb-2">My Role</p>
              <p className="text-sm text-white/80">{project.details.role}</p>
            </div>
            <div>
              <p className="label-caps text-white/50 mb-2">Problem</p>
              <p className="text-sm text-white/70 leading-relaxed">{project.details.problem}</p>
            </div>
            <div>
              <p className="label-caps text-white/50 mb-2">What I Built</p>
              <p className="text-sm text-white/70 leading-relaxed">{project.details.built}</p>
            </div>
            <div>
              <p className="label-caps text-white/50 mb-2">Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.details.stack.map((tech) => (
                  <span key={tech}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[0.65rem] font-medium text-white/70">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            {project.sourceHref && (
              <div className="pt-2">
                <a href={project.sourceHref} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-white/50 hover:text-[var(--accent)] transition-colors">
                  Source code <span>↗</span>
                </a>
              </div>
            )}
          </motion.div>
        )}
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
