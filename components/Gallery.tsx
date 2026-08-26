"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Reveal } from "./Marquee";

type Slide = {
  index: string;
  title: string;
  tag: string;
  tone: string;
};

const SLIDES: Slide[] = [
  {
    index: "01",
    title: "Variable Type",
    tag: "Interactive font-weight & style morpher",
    tone: "linear-gradient(135deg, #0c1433 0%, #101a3f 55%, #070a16 100%)",
  },
  {
    index: "02",
    title: "Wave Resonance",
    tag: "Acoustic spectrum hover modulation",
    tone: "linear-gradient(135deg, #0e1428 0%, #16204a 50%, #080a14 100%)",
  },
  {
    index: "03",
    title: "Spring Physics",
    tag: "Draggable elastic inertia sandbox",
    tone: "linear-gradient(135deg, #10131f 0%, #1a2342 60%, #090b12 100%)",
  },
  {
    index: "04",
    title: "Design Tokens",
    tag: "Live CSS matrix switchboard",
    tone: "linear-gradient(135deg, #0b1024 0%, #141d44 55%, #070910 100%)",
  },
  {
    index: "05",
    title: "Tactile Stepper",
    tag: "Interactive slide gesture confirmation",
    tone: "linear-gradient(135deg, #0d1120 0%, #182148 50%, #080a13 100%)",
  },
];

function Grain({ id }: { id: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n${id}'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n${id})'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
      }}
    />
  );
}

/* ── 01. Kinetic Variable Typography Lab ── */
function TypeStudiesLab() {
  const [activeStyle, setActiveStyle] = useState<"serif" | "italic" | "sans" | "mono">("serif");
  const [weight, setWeight] = useState(400);

  const getWeightLabel = (w: number) => {
    if (w < 250) return "Thin 100";
    if (w < 400) return "Light 300";
    if (w < 600) return "Regular 400";
    if (w < 750) return "Medium 600";
    if (w < 850) return "Bold 700";
    return "Black 900";
  };

  const handlePointer = (clientX: number, rect: DOMRect) => {
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setWeight(Math.round(100 + p * 800));
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between pointer-events-auto select-none">
      {/* Top Style Selector Pills */}
      <div className="flex gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
        {(["serif", "italic", "sans", "mono"] as const).map((s) => (
          <button
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              setActiveStyle(s);
            }}
            className={`rounded-full px-2.5 py-1 text-[0.6rem] font-mono uppercase tracking-wider transition-all ${
              activeStyle === s
                ? "bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(91,143,255,0.5)] font-semibold"
                : "text-muted hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Interactive Kinetic Letterform Canvas */}
      <div
        className="my-auto flex w-full flex-col items-center justify-center cursor-ew-resize py-1 touch-none"
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === "mouse") {
            handlePointer(e.clientX, e.currentTarget.getBoundingClientRect());
          }
        }}
        onPointerDown={(e) => {
          handlePointer(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
      >
        <motion.p
          className={`text-5xl sm:text-6xl text-white transition-all duration-150 drop-shadow-[0_0_25px_rgba(91,143,255,0.25)] ${
            activeStyle === "serif"
              ? "serif"
              : activeStyle === "italic"
              ? "serif italic"
              : activeStyle === "mono"
              ? "font-mono"
              : "font-sans"
          }`}
          style={{ fontWeight: weight }}
        >
          Aa Ж & ✦
        </motion.p>
      </div>

      {/* Touch-Friendly Slider Track & Metrics */}
      <div className="flex w-full max-w-[220px] flex-col items-center gap-1.5">
        <input
          type="range"
          min={100}
          max={900}
          step={10}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full accent-[var(--accent)] cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none"
        />
        <div className="flex items-center gap-2 text-[0.6rem] font-mono text-muted/70">
          <span className="text-[var(--accent)] font-semibold">{getWeightLabel(weight)}</span>
          <span>·</span>
          <span className="text-[0.55rem] tracking-wider uppercase">Slide or drag to morph</span>
        </div>
      </div>
    </div>
  );
}

/* ── 02. Interactive Wave Resonance Lab ── */
function WaveFrequencyLab() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const baseHeights = [20, 38, 60, 32, 75, 48, 92, 65, 88, 52, 78, 36, 62, 28, 45, 22];

  const handlePointer = (clientX: number, rect: DOMRect) => {
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.floor(p * baseHeights.length);
    setHoverIndex(Math.max(0, Math.min(baseHeights.length - 1, idx)));
  };

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between pointer-events-auto select-none touch-none"
      onPointerLeave={() => setHoverIndex(null)}
      onPointerMove={(e) => {
        handlePointer(e.clientX, e.currentTarget.getBoundingClientRect());
      }}
      onPointerDown={(e) => {
        handlePointer(e.clientX, e.currentTarget.getBoundingClientRect());
      }}
    >
      {/* Status hint */}
      <span className="text-[0.6rem] font-mono text-muted/70 tracking-wider uppercase">
        Sweep finger or mouse across spectrum
      </span>

      {/* Frequency Equalizer Bars */}
      <div className="my-auto flex items-center justify-center gap-1.5 h-24 w-full px-2 cursor-pointer">
        {baseHeights.map((h, i) => {
          const isNear = hoverIndex !== null && Math.abs(hoverIndex - i) <= 2;
          const boost = isNear ? (3 - Math.abs(hoverIndex! - i)) * 18 : 0;
          return (
            <motion.div
              key={i}
              className="flex-1 max-w-[8px] rounded-full"
              animate={{
                height: `${Math.min(100, h + boost)}%`,
                backgroundColor: isNear ? "#5b8fff" : "rgba(232, 230, 225, 0.2)",
                boxShadow: isNear ? "0 0 16px #5b8fff" : "0 0 0px transparent",
              }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
            />
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center gap-2 text-[0.6rem] font-mono text-muted/70">
        <span className="text-[var(--accent)] font-semibold">16 Band Harmonic Resonance</span>
      </div>
    </div>
  );
}

/* ── 03. Draggable Spring Physics Sandbox ── */
function SpringPhysicsLab() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [metrics, setMetrics] = useState({ distance: 0, tension: "0.0", stiffness: 350 });
  const [isDragging, setIsDragging] = useState(false);

  // Sync metrics continuously on every frame
  useMotionValueEvent(x, "change", (latestX) => {
    const latestY = y.get();
    const d = Math.round(Math.hypot(latestX, latestY));
    setMetrics({
      distance: d,
      tension: (d * 0.45).toFixed(1),
      stiffness: Math.round(350 + d * 3.2),
    });
  });

  useMotionValueEvent(y, "change", (latestY) => {
    const latestX = x.get();
    const d = Math.round(Math.hypot(latestX, latestY));
    setMetrics({
      distance: d,
      tension: (d * 0.45).toFixed(1),
      stiffness: Math.round(350 + d * 3.2),
    });
  });

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between pointer-events-auto select-none touch-none">
      {/* Instruction */}
      <span className="text-[0.6rem] font-mono text-muted/70 tracking-wider uppercase">
        {isDragging ? "Release to fling" : "Grab & pull the spring puck"}
      </span>

      {/* Arena Stage */}
      <div className="relative my-auto flex h-28 w-full items-center justify-center">
        {/* Dynamic Elastic String Line bound directly to motion values */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none overflow-visible"
          viewBox="-150 -70 300 140"
        >
          {/* Origin anchor dot */}
          <circle cx={0} cy={0} r={3} fill="rgba(255,255,255,0.4)" />

          {/* Elastic tether line that stays 100% synced with circle position */}
          <motion.line
            x1={0}
            y1={0}
            x2={x}
            y2={y}
            stroke={isDragging ? "#5b8fff" : "rgba(255,255,255,0.25)"}
            strokeWidth={isDragging ? 2.5 : 1}
            strokeDasharray={isDragging ? undefined : "3 3"}
          />
        </svg>

        {/* Real Physics Puck */}
        <motion.div
          style={{ x, y, touchAction: "none" }}
          drag
          dragConstraints={{ left: -110, right: 110, top: -50, bottom: 50 }}
          dragElastic={0.45}
          dragTransition={{ bounceStiffness: 450, bounceDamping: 18 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-20 size-12 rounded-full bg-gradient-to-br from-[#1c2c63] to-[#0c132b] border border-[var(--accent)]/80 shadow-[0_0_24px_rgba(91,143,255,0.45)] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-md touch-none"
        >
          <span className="size-1.5 rounded-full bg-white drop-shadow-[0_0_4px_#5b8fff]" />
          <span className="mt-0.5 text-[0.45rem] font-mono text-[var(--accent)] font-semibold tracking-tighter">
            PULL
          </span>
        </motion.div>
      </div>

      {/* Dynamic Live Physics Telemetry */}
      <div className="flex items-center gap-2 text-[0.6rem] font-mono text-muted/70">
        <span className="text-[var(--accent)] font-semibold">Tension {metrics.tension}N</span>
        <span>·</span>
        <span className="text-white font-medium">Stiffness {metrics.stiffness}</span>
        <span>·</span>
        <span>{metrics.distance > 2 ? `Δ ${metrics.distance}px` : "Rest"}</span>
      </div>
    </div>
  );
}

/* ── 04. Interactive Design Token Switchboard ── */
function DesignTokensLab() {
  const [radius, setRadius] = useState<"sm" | "md" | "full">("md");
  const [glow, setGlow] = useState(true);
  const [glass, setGlass] = useState(true);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between pointer-events-auto select-none">
      {/* Live Controlled Specimen Card */}
      <motion.div
        layout
        className={`h-12 w-40 border flex items-center justify-center gap-2 transition-all duration-300 ${
          radius === "sm" ? "rounded-md" : radius === "md" ? "rounded-xl" : "rounded-full"
        } ${
          glass
            ? "bg-white/10 backdrop-blur-md border-white/20"
            : "bg-[#0f1838] border-[var(--accent)]/60"
        } ${
          glow ? "shadow-[0_0_20px_rgba(91,143,255,0.4)]" : "shadow-none"
        }`}
      >
        <span className="size-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="text-[0.7rem] font-mono text-white font-medium">--token-card</span>
      </motion.div>

      {/* Switchboard Toggles */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {/* Radius controls */}
        <div className="flex bg-white/5 p-0.5 rounded-md border border-white/10 text-[0.6rem] font-mono">
          {(["sm", "md", "full"] as const).map((r) => (
            <button
              key={r}
              onClick={(e) => {
                e.stopPropagation();
                setRadius(r);
              }}
              className={`px-2 py-1 rounded uppercase font-semibold ${
                radius === r ? "bg-[var(--accent)] text-white" : "text-muted hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Glow Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGlow(!glow);
          }}
          className={`px-2.5 py-1.5 rounded-md border text-[0.6rem] font-mono font-semibold transition-all ${
            glow
              ? "border-[var(--accent)] bg-[var(--accent)]/20 text-white shadow-[0_0_8px_rgba(91,143,255,0.3)]"
              : "border-white/10 bg-white/5 text-muted"
          }`}
        >
          GLOW: {glow ? "ON" : "OFF"}
        </button>

        {/* Glass Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGlass(!glass);
          }}
          className={`px-2.5 py-1.5 rounded-md border text-[0.6rem] font-mono font-semibold transition-all ${
            glass
              ? "border-white/30 bg-white/15 text-white"
              : "border-white/10 bg-white/5 text-muted"
          }`}
        >
          {glass ? "GLASS" : "SOLID"}
        </button>
      </div>

      {/* Metrics */}
      <span className="text-[0.6rem] font-mono text-muted/70">Click controls to mutate CSS variables</span>
    </div>
  );
}

/* ── 05. Tactile Gesture Confirmation Slider ── */
function GestureSliderLab() {
  const [complete, setComplete] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between pointer-events-auto select-none">
      {/* Top hint */}
      <span className="text-[0.6rem] font-mono text-muted/70 tracking-wider uppercase">
        {complete ? "Verified successfully" : "Slide knob right to verify"}
      </span>

      {/* Interactive Drag Track */}
      <div className="my-auto flex flex-col items-center justify-center w-full max-w-[240px] gap-2">
        <div className="relative h-11 w-full rounded-full bg-white/5 border border-white/15 p-1 flex items-center overflow-hidden backdrop-blur-md touch-none">
          {/* Progress fill */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[var(--accent)]/30 to-[var(--accent)]/60 rounded-full pointer-events-none"
            style={{ width: `${Math.max(12, dragProgress * 100)}%` }}
          />

          {/* Hint text */}
          <span
            className={`w-full text-center text-[0.65rem] font-mono tracking-wider transition-opacity duration-300 pointer-events-none ${
              complete ? "text-[var(--accent)] font-semibold" : "text-muted/60"
            }`}
          >
            {complete ? "CONFIRMED ✓" : "SLIDE TO VERIFY ➔"}
          </span>

          {/* Draggable Knob */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 180 }}
            dragElastic={0.1}
            style={{ touchAction: "none" }}
            onDrag={(_, info) => {
              const p = Math.min(1, Math.max(0, info.offset.x / 170));
              setDragProgress(p);
              if (p >= 0.95) setComplete(true);
            }}
            onDragEnd={() => {
              if (dragProgress < 0.95) {
                setDragProgress(0);
                setComplete(false);
              }
            }}
            animate={complete ? { x: 180 } : undefined}
            className="absolute left-1 size-9 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.6)] cursor-grab active:cursor-grabbing z-20 text-xs touch-none"
          >
            {complete ? "✓" : "➔"}
          </motion.div>
        </div>

        {complete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setComplete(false);
              setDragProgress(0);
            }}
            className="text-[0.55rem] font-mono text-muted hover:text-white underline uppercase tracking-wider py-1"
          >
            Reset Gesture
          </button>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-[0.6rem] font-mono">
        <span className={complete ? "text-emerald-400 font-semibold" : "text-muted/70"}>
          Status: {complete ? "CONFIRMED" : "IDLE"}
        </span>
      </div>
    </div>
  );
}

function Card({ slide }: { slide: Slide }) {
  return (
    <div
      className="group relative flex h-[48vh] sm:h-[54vh] w-[80vw] sm:w-[48vw] lg:w-[38vw] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-2xl border border-[var(--hairline)] p-6 sm:p-7 transition-all duration-500 hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(91,143,255,0.06)]"
      style={{ background: slide.tone }}
    >
      <Grain id={slide.index} />

      {/* ── 1. CARD HEADER (Unified & Clean) ── */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="serif accent text-lg italic">{slide.index}</span>
          <span className="label-caps text-faint text-[0.65rem] tracking-[0.2em] uppercase">Fragment // Lab</span>
        </div>
        <span className="label-caps text-[0.6rem] text-muted rounded-full border border-white/10 px-2.5 py-0.5 bg-white/5 backdrop-blur-md">
          Interactive
        </span>
      </div>

      {/* ── 2. CARD PLAYGROUND STAGE (Dedicated Middle Stage) ── */}
      <div className="relative my-auto flex h-[55%] w-full items-center justify-center py-2 z-10">
        {slide.index === "01" && <TypeStudiesLab />}
        {slide.index === "02" && <WaveFrequencyLab />}
        {slide.index === "03" && <SpringPhysicsLab />}
        {slide.index === "04" && <DesignTokensLab />}
        {slide.index === "05" && <GestureSliderLab />}
      </div>

      {/* ── 3. CARD FOOTER (Clean Editorial Typography) ── */}
      <div className="relative z-10 border-t border-white/5 pt-3 pointer-events-none">
        <h3 className="display text-xl sm:text-2xl font-normal tracking-tight text-white transition-transform duration-500 group-hover:translate-x-1">
          {slide.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted leading-relaxed">
          {slide.tag}
        </p>
      </div>
    </div>
  );
}

function Pinned() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(0);
  const [height, setHeight] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });
  const snapped = useTransform(smooth, (v) => (v < 0.02 ? 0 : v > 0.98 ? 1 : v));
  const x = useTransform(snapped, [0, 1], [0, -range]);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const next = Math.max(track.scrollWidth - window.innerWidth + 96, 0);
      setRange(next);
      setHeight(next + window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={wrapRef} style={{ height: height ?? "280vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max items-stretch gap-6 px-6 sm:px-12"
        >
          {SLIDES.map((slide) => (
            <Card key={slide.index} slide={slide} />
          ))}
        </motion.div>
        <p className="label-caps mt-6 px-6 text-faint sm:px-12">
          Scroll — the wall moves sideways
        </p>
      </div>
    </div>
  );
}

function Native() {
  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:px-12">
      {SLIDES.map((slide) => (
        <Card key={slide.index} slide={slide} />
      ))}
    </div>
  );
}

export default function Gallery() {
  const reduce = useReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pinned = desktop && !reduce;

  return (
    <section aria-label="Visual lab" className="relative py-24 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral">
        02
      </span>
      <span
        aria-hidden="true"
        className="edge-label label-caps absolute left-3 top-40 hidden text-faint lg:block"
      >
        Visual Lab — Experiments
      </span>

      <div className="mb-12 px-6 sm:px-12">
        <Reveal>
          <p className="label-caps accent">Visual Lab</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
            <span className="text-outline">Fragments</span> from
            <br />
            the{" "}
            <em className="serif accent text-[1.06em] italic">lab.</em>
          </h2>
        </Reveal>
      </div>

      {pinned ? <Pinned /> : <Native />}
    </section>
  );
}
