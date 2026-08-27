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
  },
];

/* ── 1. Interactive KachaniOS AI Autonomous Agent Sandbox ── */
function KachaniosLiveEngine() {
  const [activeTask, setActiveTask] = useState<"security" | "memory" | "optimizer">("security");
  const [selectedNode, setSelectedNode] = useState<string>("kernel");
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamIndex, setStreamIndex] = useState(4);

  const tasks = {
    security: {
      title: "Security & Auth AST Audit",
      target: "@security-auditor",
      telemetry: [
        { level: "KERNEL", msg: "Decomposed prompt: 'Verify zero Auth token leaks in Server Actions'", color: "text-[var(--accent)]" },
        { level: "AST_SCAN", msg: "Parsed 48 TypeScript AST nodes across /app/api routes", color: "text-indigo-300" },
        { level: "INVARIANT", msg: "Checking JWT cookie HttpOnly & SameSite=Strict invariants", color: "text-emerald-400" },
        { level: "VERIFIED", msg: "Convergence loop passed: 0 vulnerabilities found · 8ms", color: "text-amber-300" },
      ],
    },
    memory: {
      title: "Vector Memory & Vault Synthesis",
      target: "@memory-vault",
      telemetry: [
        { level: "QUERY", msg: "Semantic retrieval: 'Anti-lag GPU compositing & layer isolation'", color: "text-[var(--accent)]" },
        { level: "EMBEDDING", msg: "Cosine similarity: 0.964 across 1,840 project vector points", color: "text-cyan-300" },
        { level: "CLUSTER", msg: "Cross-referenced @code-architect and @eval-judge vaults", color: "text-purple-300" },
        { level: "SYNTHESIS", msg: "Durable memory handoff complete · Context window 14.2k / 200k", color: "text-emerald-400" },
      ],
    },
    optimizer: {
      title: "AST Tree-Shaking & Bundle Optimizer",
      target: "@code-architect",
      telemetry: [
        { level: "ANALYZER", msg: "Tracing dependency graph for dead code & dynamic imports", color: "text-indigo-300" },
        { level: "MUTATION", msg: "Promoting static icons to SVG sprite sheets (-34kb payload)", color: "text-amber-300" },
        { level: "BENCHMARK", msg: "LCP predicted: 0.42s · CLS: 0.000 · GPU memory -18MB", color: "text-[var(--accent)]" },
        { level: "SUCCESS", msg: "Production build validated · 0 type errors · 120 FPS", color: "text-emerald-400" },
      ],
    },
  };

  const nodes = [
    { id: "kernel", label: "Kernel", x: 50, y: 50, color: "#5b8fff" },
    { id: "planner", label: "Planner", x: 18, y: 22, color: "#818cf8" },
    { id: "vault", label: "Vault", x: 82, y: 22, color: "#22d3ee" },
    { id: "harness", label: "Harness", x: 18, y: 78, color: "#c084fc" },
    { id: "judge", label: "Judge", x: 82, y: 78, color: "#34d399" },
  ];

  const edges = [
    { from: "planner", to: "kernel" },
    { from: "vault", to: "kernel" },
    { from: "kernel", to: "harness" },
    { from: "kernel", to: "judge" },
    { from: "planner", to: "vault" },
    { from: "harness", to: "judge" },
  ];

  const nodeDetails: Record<string, { role: string; latency: string; status: string; desc: string }> = {
    kernel: { role: "Orchestration Kernel", latency: "1.2ms", status: "ONLINE", desc: "Autonomous loop controller & task graph dispatcher" },
    planner: { role: "Planner & Decomposer", latency: "3.4ms", status: "ACTIVE", desc: "Decomposes goals into verifiable machine-decidable steps" },
    vault: { role: "1536-dim Vector Memory", latency: "2.1ms", status: "INDEXED", desc: "Embeddings vault for cross-session knowledge & instincts" },
    harness: { role: "Sandboxed AST Runner", latency: "4.8ms", status: "SAFE", desc: "Zero-network sandboxed execution & unit test verifier" },
    judge: { role: "Adversarial Verifier", latency: "2.6ms", status: "READY", desc: "Independent quality gate & 5-axis self-evaluator" },
  };

  const handleRunTask = (t: "security" | "memory" | "optimizer") => {
    setActiveTask(t);
    setIsExecuting(true);
    setStreamIndex(1);
    setTimeout(() => setStreamIndex(2), 180);
    setTimeout(() => setStreamIndex(3), 420);
    setTimeout(() => {
      setStreamIndex(4);
      setIsExecuting(false);
    }, 720);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-4 sm:p-5 font-mono select-none pointer-events-auto bg-[#070b16]">
      {/* ── 1. Top OS Chrome Header ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-red-500/80" />
            <span className="size-2 rounded-full bg-amber-500/80" />
            <span className="size-2 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[0.65rem] sm:text-xs font-bold tracking-wider text-white">
            KACHANI.OS <span className="text-white/40 font-normal hidden sm:inline">v2.4 // COGNITIVE AGENT HARNESS</span>
          </span>
        </div>

        {/* Live Telemetry Status Pill */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.55rem] text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>120 FPS · 8ms · ZERO-DEFECT</span>
        </div>
      </div>

      {/* ── 2. Clickable Task Scenario Triggers ── */}
      <div className="flex flex-wrap items-center gap-2 py-2 border-b border-white/5 z-10">
        <span className="text-[0.55rem] uppercase tracking-wider text-white/40 mr-1">RUN AGENT PIPELINE:</span>
        {(["security", "memory", "optimizer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRunTask(t);
            }}
            className={`rounded-full px-2.5 py-1 text-[0.58rem] transition-all cursor-pointer border ${
              activeTask === t
                ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_0_12px_rgba(91,143,255,0.4)] font-semibold"
                : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
            }`}
          >
            {t === "security" && "⚡ Security Audit"}
            {t === "memory" && "🧠 Vector Vault"}
            {t === "optimizer" && "🚀 AST Optimizer"}
          </button>
        ))}
      </div>

      {/* ── 3. Main Split Stage: Telemetry Stream + Real 2D Laser Node Graph ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto items-center py-2 z-10">
        {/* Left: Real-time Terminal Stream */}
        <div className="md:col-span-7 flex flex-col justify-between bg-black/60 rounded-xl border border-white/10 p-3 backdrop-blur-md min-h-[145px]">
          <div className="flex items-center justify-between text-[0.55rem] text-muted/60 border-b border-white/5 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--accent)] font-bold">EXECUTION LOG:</span>
              <span className="text-white/80">{tasks[activeTask].title}</span>
            </span>
            {isExecuting ? (
              <span className="text-amber-400 font-semibold animate-pulse">EXECUTING...</span>
            ) : (
              <span className="text-emerald-400 font-semibold">SUCCESS ✓</span>
            )}
          </div>

          <div className="space-y-1.5 my-1.5">
            {tasks[activeTask].telemetry.slice(0, streamIndex).map((log, i) => (
              <motion.div
                key={`${activeTask}-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-1.5 text-[0.58rem] leading-tight"
              >
                <span className={`font-bold ${log.color}`}>[{log.level}]</span>
                <span className="text-white/80 line-clamp-1">{log.msg}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[0.5rem] text-white/40 pt-1 border-t border-white/5">
            <span>TARGET: {tasks[activeTask].target}</span>
            <span>CONTEXT: 14.2k / 200k</span>
          </div>
        </div>

        {/* Right: Interactive 2D Neural DAG Canvas with Laser Connections */}
        <div className="md:col-span-5 relative flex flex-col justify-between bg-[#0b1022]/80 rounded-xl border border-white/10 p-2.5 backdrop-blur-md min-h-[145px]">
          <div className="flex items-center justify-between text-[0.52rem] text-white/50 border-b border-white/5 pb-1 z-10">
            <span>NEURAL TOPOLOGY (CLICK NODE)</span>
            <span className="text-[var(--accent)]">{nodeDetails[selectedNode].latency}</span>
          </div>

          {/* 2D Laser Graph Canvas */}
          <div className="relative h-20 w-full my-auto flex items-center justify-center">
            {/* SVG Laser Topology Edges */}
            <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
              {edges.map((edge, idx) => {
                const src = nodes.find((n) => n.id === edge.from)!;
                const dst = nodes.find((n) => n.id === edge.to)!;
                const isIncident = selectedNode === edge.from || selectedNode === edge.to;
                return (
                  <line
                    key={idx}
                    x1={`${src.x}%`}
                    y1={`${src.y}%`}
                    x2={`${dst.x}%`}
                    y2={`${dst.y}%`}
                    stroke={isIncident ? "#5b8fff" : "rgba(255,255,255,0.18)"}
                    strokeWidth={isIncident ? "2" : "1"}
                    strokeDasharray={isExecuting ? "3 3" : undefined}
                    className={isExecuting ? "animate-pulse" : ""}
                  />
                );
              })}
            </svg>

            {/* Interactive 2D Floating Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <motion.button
                  key={node.id}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node.id);
                  }}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer z-10 backdrop-blur-md ${
                    isSelected
                      ? "bg-[var(--accent)]/30 border-[var(--accent)] text-white shadow-[0_0_15px_rgba(91,143,255,0.6)] scale-110"
                      : "bg-black/70 border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${isSelected ? "animate-ping" : ""}`}
                    style={{ backgroundColor: node.color }}
                  />
                  <span className="text-[0.5rem] font-bold">{node.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Node Inspector Bottom Drawer */}
          <div className="rounded bg-black/50 border border-white/5 p-1.5 text-[0.5rem] z-10">
            <p className="text-white/90 font-semibold">{nodeDetails[selectedNode].role}</p>
            <p className="text-muted/70 text-[0.48rem] line-clamp-1 mt-0.5">{nodeDetails[selectedNode].desc}</p>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Metrics Ribbon ── */}
      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[0.52rem] text-muted z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <span>MODEL: HYBRID-REASONING</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">EVAL: 99.8% PRECISION</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/40">CONVERGENCE:</span>
          <span className="text-[var(--accent)] font-semibold">ZERO-DRIFT PASSED</span>
        </div>
      </div>
    </div>
  );
}

/* ── 2. Handcrafted Interactive Aura Pay Mobile FinTech Prototype ── */
function AuraPayLiveSimulator() {
  const [currency, setCurrency] = useState<"USD" | "EUR" | "ETH">("USD");
  const [isFrozen, setIsFrozen] = useState(false);
  const [faceIdState, setFaceIdState] = useState<"idle" | "scanning" | "verified">("idle");
  const [activeDayIndex, setActiveDayIndex] = useState(2); // Wednesday

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const xCoords = [20, 65, 110, 155, 200, 245, 290];

  const currencyData = {
    USD: {
      total: "$142,850.75",
      spending: ["$320", "$450", "$1,245", "$680", "$890", "$210", "$140"],
      yCoords: [38, 28, 12, 26, 18, 44, 48],
    },
    EUR: {
      total: "€131,422.60",
      spending: ["€295", "€410", "€1,145", "€620", "€820", "€190", "€130"],
      yCoords: [36, 26, 14, 28, 20, 42, 46],
    },
    ETH: {
      total: "42.85 ETH",
      spending: ["0.09 ETH", "0.14 ETH", "0.38 ETH", "0.21 ETH", "0.28 ETH", "0.06 ETH", "0.04 ETH"],
      yCoords: [40, 30, 10, 24, 16, 46, 50],
    },
  };

  const currentData = currencyData[currency];
  const activeY = currentData.yCoords[activeDayIndex];
  const activeX = xCoords[activeDayIndex];

  // Dynamic SVG Cubic Bezier Path calculation
  const pathD = `M 20 ${currentData.yCoords[0]} C 42 ${currentData.yCoords[0]}, 43 ${currentData.yCoords[1]}, 65 ${currentData.yCoords[1]} C 87 ${currentData.yCoords[1]}, 88 ${currentData.yCoords[2]}, 110 ${currentData.yCoords[2]} C 132 ${currentData.yCoords[2]}, 133 ${currentData.yCoords[3]}, 155 ${currentData.yCoords[3]} C 177 ${currentData.yCoords[3]}, 178 ${currentData.yCoords[4]}, 200 ${currentData.yCoords[4]} C 222 ${currentData.yCoords[4]}, 223 ${currentData.yCoords[5]}, 245 ${currentData.yCoords[5]} C 267 ${currentData.yCoords[5]}, 268 ${currentData.yCoords[6]}, 290 ${currentData.yCoords[6]}`;
  const areaD = `${pathD} L 290 58 L 20 58 Z`;

  const handleFaceIdAuth = () => {
    setFaceIdState("scanning");
    setTimeout(() => {
      setFaceIdState("verified");
      setTimeout(() => setFaceIdState("idle"), 3000);
    }, 900);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-4 sm:p-5 font-mono select-none pointer-events-auto bg-[#0d0a1c]">
      {/* ── 1. Top Phone Chrome & Dynamic Island ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[0.6rem] font-bold text-white/70">9:41</span>
          <span className="text-[0.55rem] text-white/40 hidden sm:inline">5G · 100%</span>
        </div>

        {/* Dynamic Island Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-black/70 px-3 py-0.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
          <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[0.58rem] text-violet-200 font-semibold">
            {faceIdState === "scanning" ? "Scanning Face..." : faceIdState === "verified" ? "FaceID Verified ✓" : "AURA SPATIAL OS"}
          </span>
        </div>

        {/* Currency Switcher */}
        <div className="flex gap-1 rounded-full border border-white/10 bg-black/50 p-0.5 backdrop-blur-md">
          {(["USD", "EUR", "ETH"] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrency(curr);
              }}
              className={`rounded-full px-2 py-0.5 text-[0.52rem] uppercase tracking-wider transition-all cursor-pointer ${
                currency === curr
                  ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] font-semibold"
                  : "text-muted hover:text-white"
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Middle Split: Interactive Titanium Card + Live Animated Spline Graph ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto items-center py-2 z-10">
        {/* Left: Interactive Holographic Titanium Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`md:col-span-5 relative flex flex-col justify-between p-3 rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden min-h-[140px] ${
            isFrozen
              ? "bg-[#0b1329]/90 border-cyan-500/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              : "bg-gradient-to-br from-[#2a1752] via-[#1a0e36] to-[#0d071d] border-violet-500/40 text-white shadow-[0_0_25px_rgba(168,85,247,0.2)]"
          }`}
        >
          <div className="flex items-center justify-between z-10">
            <span className="text-[0.55rem] uppercase tracking-widest font-bold text-violet-300">
              {isFrozen ? "❄️ CARD FROZEN" : "✦ TITANIUM METAL"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFrozen(!isFrozen);
              }}
              className="text-[0.48rem] px-2 py-0.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-all text-white cursor-pointer"
            >
              {isFrozen ? "UNFREEZE" : "FREEZE"}
            </button>
          </div>

          <div className="my-1.5 z-10">
            <span className="text-[0.5rem] text-white/50 uppercase tracking-wider">Total Liquidity</span>
            <p className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {currentData.total}
            </p>
          </div>

          <div className="flex items-center justify-between text-[0.52rem] text-white/60 z-10">
            <span>•••• 8824</span>
            <span className="font-semibold text-violet-400">EXP 09/29</span>
          </div>
        </motion.div>

        {/* Right: Live Interactive Spline Graph with Scrubber Beacon */}
        <div className="md:col-span-7 flex flex-col justify-between bg-black/60 rounded-xl border border-white/10 p-3 backdrop-blur-md min-h-[140px]">
          <div className="flex items-center justify-between text-[0.52rem] border-b border-white/5 pb-1">
            <span className="text-white/60">SPENDING ACTIVITY</span>
            <span className="text-violet-300 font-semibold bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
              {days[activeDayIndex]}: {currentData.spending[activeDayIndex]}
            </span>
          </div>

          {/* Interactive SVG Spline Curve + Animated Scrubber Point */}
          <div className="relative h-14 w-full my-1 flex items-center">
            <svg viewBox="0 0 310 60" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="violet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.25)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0.0)" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path d={areaD} fill="url(#area-gradient)" />

              {/* Spline curve line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#violet-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Vertical Laser Guideline */}
              <line
                x1={activeX}
                y1={activeY}
                x2={activeX}
                y2={58}
                stroke="#a855f7"
                strokeDasharray="2 2"
                strokeWidth="1.5"
                opacity={0.8}
              />

              {/* Animated Scrubber Outer Pulse Ring */}
              <circle
                cx={activeX}
                cy={activeY}
                r="7"
                stroke="#a855f7"
                strokeWidth="1.5"
                fill="none"
                className="animate-ping"
              />

              {/* Active Scrubber Center Dot */}
              <circle
                cx={activeX}
                cy={activeY}
                r="4.5"
                fill="#ffffff"
                stroke="#a855f7"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Day Scrubber Buttons */}
          <div className="flex justify-between items-center pt-1 border-t border-white/5">
            {days.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDayIndex(i);
                }}
                className={`text-[0.5rem] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  activeDayIndex === i
                    ? "bg-violet-500/30 text-violet-200 font-bold border border-violet-500/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Biometrics Bar & Action CTA ── */}
      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[0.52rem] z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFaceIdAuth();
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/40 bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 transition-all cursor-pointer"
        >
          <span className="size-1.5 rounded-full bg-violet-400 animate-ping" />
          <span>{faceIdState === "verified" ? "FaceID Authorized ✓" : "Tap to Authenticate FaceID"}</span>
        </button>

        <div className="flex items-center gap-2 text-muted">
          <span>ZERO-KNOWLEDGE SETTLED</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">4ms LATENCY</span>
        </div>
      </div>
    </div>
  );
}

/* ── High-res 2K Visual Preview Panel ── */
function ProjectPreview({ project }: { project: Project }) {
  return (
    <div
      className={`relative h-[280px] sm:h-[340px] md:h-[380px] w-full overflow-hidden rounded-xl bg-gradient-to-br ${project.tone}`}
    >
      {/* Handcrafted Interactive Engine for Project 02 (KachaniOS) */}
      {project.index === "02" && <KachaniosLiveEngine />}

      {/* Handcrafted Interactive Simulator for Project 03 (Aura Pay) */}
      {project.index === "03" && <AuraPayLiveSimulator />}

      {/* High-res Crisp Visual Preview for Project 01 (Yalla China) */}
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

      {/* Live badge or Interactive Sandbox Pill */}
      {project.live ? (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[rgba(91,143,255,0.18)] px-3 py-1 backdrop-blur-md">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          <span className="label-caps accent">Live App ↗</span>
        </div>
      ) : (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="label-caps text-white/90">Interactive Prototype</span>
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
          <div className="max-w-xl">
            <p className="text-sm leading-relaxed text-muted">
              {project.subtitle}
            </p>
            {project.href ? (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                <span>Visit Live Production Platform</span>
                <span>↗</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-1.5 mt-2 text-xs text-white/50">
                <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                <span>Interactive sandbox · Test live controls directly in card above</span>
              </div>
            )}
          </div>
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
