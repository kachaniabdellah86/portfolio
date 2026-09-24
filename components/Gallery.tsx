"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Reveal } from "./Marquee";
import { useReducedMotionPreference } from "./use-reduced-motion";

type Slide = {
  index: string;
  title: string;
  tag: string;
  gesture: string;
  tone: string;
};

const SLIDES: Slide[] = [
  {
    index: "01",
    title: "Variable Type",
    tag: "Each letter's weight follows your finger, from 100 to 900 on one variable axis.",
    gesture: "Drag across",
    tone: "linear-gradient(135deg, #0c1433 0%, #101a3f 55%, #070a16 100%)",
  },
  {
    index: "02",
    title: "Signal Field",
    tag: "A live canvas of signal lines that bends around touch and carries pulses.",
    gesture: "Tap · drag",
    tone: "linear-gradient(135deg, #0e1428 0%, #16204a 50%, #080a14 100%)",
  },
  {
    index: "03",
    title: "Spring Physics",
    tag: "A real damped spring. Fling it, change its character, watch the decay.",
    gesture: "Pull & fling",
    tone: "linear-gradient(135deg, #10131f 0%, #1a2342 60%, #090b12 100%)",
  },
  {
    index: "04",
    title: "Design Tokens",
    tag: "One hue token re-themes a whole component, with the contrast checked live.",
    gesture: "Turn the hue",
    tone: "linear-gradient(135deg, #0b1024 0%, #141d44 55%, #070910 100%)",
  },
  {
    index: "05",
    title: "Slide to Confirm",
    tag: "A payment gesture with resistance, snap-back and a haptic confirmation.",
    gesture: "Slide right",
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

/** Runs `frame` on every animation frame while `active` is true. */
function useFrameLoop(active: boolean, frame: (time: number, delta: number) => void) {
  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  });

  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      frameRef.current(now / 1000, delta);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

function useLabActive(ref: RefObject<Element | null>) {
  const inView = useInView(ref, { amount: 0.25 });
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return inView && pageVisible;
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.6rem] font-mono uppercase tracking-[0.18em] text-white/45">{children}</span>
  );
}

/* ── 01. Variable type that follows the finger ── */

const TYPE_WORD = "Motion";

function TypeStudiesLab() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const pointer = useRef<{ x: number; lastInput: number }>({ x: -1, lastInput: -10 });
  const reduce = useReducedMotionPreference();
  const active = useLabActive(stageRef);

  const setPointer = (clientX: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    pointer.current = { x: clientX - rect.left, lastInput: performance.now() / 1000 };
  };

  useFrameLoop(active, (time) => {
    const stage = stageRef.current;
    if (!stage) return;
    const letters = lettersRef.current.filter((letter): letter is HTMLSpanElement => letter !== null);
    if (letters.length === 0) return;
    const wordLeft = letters[0].offsetLeft;
    const wordRight = letters[letters.length - 1].offsetLeft + letters[letters.length - 1].offsetWidth;
    const wordWidth = Math.max(1, wordRight - wordLeft);
    const idle = time - pointer.current.lastInput > 1.6;
    // With no input the focus sweeps across the word on its own, so the
    // specimen is alive before anyone touches it.
    const focusX = idle
      ? reduce
        ? wordLeft + wordWidth / 2
        : wordLeft + wordWidth * (0.5 + Math.sin(time * 1.2) * 0.55)
      : pointer.current.x;
    let peak = 100;
    letters.forEach((letter) => {
      const center = letter.offsetLeft + letter.offsetWidth / 2;
      const distance = (center - focusX) / (wordWidth * 0.2);
      const target = 100 + 800 * Math.exp(-distance * distance);
      const current = Number(letter.dataset.weight ?? 100);
      const next = current + (target - current) * 0.2;
      letter.dataset.weight = String(next);
      letter.style.fontWeight = String(Math.round(next));
      letter.style.opacity = String(0.45 + ((next - 100) / 800) * 0.55);
      peak = Math.max(peak, next);
    });
    if (readoutRef.current) readoutRef.current.textContent = String(Math.round(peak / 10) * 10);
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <Hint>Drag across the letters</Hint>
      <div
        ref={stageRef}
        className="relative flex w-full cursor-ew-resize items-center justify-center py-4"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(event) => setPointer(event.clientX)}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || event.buttons > 0) setPointer(event.clientX);
        }}
        aria-label={`The word ${TYPE_WORD} set in a variable font whose weight follows the pointer`}
        role="img"
      >
        <p className="display flex whitespace-nowrap text-[clamp(2.7rem,11vw,4.4rem)] leading-none text-white">
          {TYPE_WORD.split("").map((char, index) => (
            <span
              key={index}
              ref={(node) => {
                lettersRef.current[index] = node;
              }}
              aria-hidden="true"
              style={{ fontWeight: 100 }}
            >
              {char}
            </span>
          ))}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[0.6rem] font-mono text-white/50">
        <span>Zodiak Variable</span>
        <span>·</span>
        <span className="text-[var(--accent)]">
          wght <span ref={readoutRef}>100</span>
        </span>
      </div>
    </div>
  );
}

/* ── 02. Signal field on a canvas ── */

type Ripple = { x: number; y: number; born: number };

function SignalFieldLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, strength: 0, target: 0 });
  const ripples = useRef<Ripple[]>([]);
  const [pulses, setPulses] = useState(0);
  const reduce = useReducedMotionPreference();
  const active = useLabActive(canvasRef);

  const toLocal = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  useFrameLoop(active, (time, delta) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const p = pointer.current;
    p.strength += (p.target - p.strength) * Math.min(1, delta * 6);
    const drift = reduce ? 0 : time;
    ripples.current = ripples.current.filter((ripple) => time - ripple.born < 2.2);

    const lines = 13;
    for (let line = 0; line < lines; line += 1) {
      const baseY = ((line + 1) / (lines + 1)) * height;
      const depth = line / (lines - 1);
      context.beginPath();
      for (let x = 0; x <= width; x += 6) {
        let y = baseY + Math.sin(x * 0.022 + drift * 1.3 + line * 0.55) * (3 + depth * 4);
        // The pointer parts the lines like a hand through water.
        const dx = x - p.x;
        const dy = baseY - p.y;
        const reach = Math.exp(-(dx * dx + dy * dy) / 2600) * p.strength;
        y += Math.sign(dy || 1) * reach * 22;
        for (const ripple of ripples.current) {
          const age = time - ripple.born;
          const distance = Math.hypot(x - ripple.x, baseY - ripple.y);
          const front = distance - age * 170;
          y += Math.sin(front * 0.09) * Math.exp(-front * front / 900) * 16 * (1 - age / 2.2);
        }
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      const alpha = 0.18 + (1 - Math.abs(depth - 0.5) * 2) * 0.5;
      context.strokeStyle = `rgba(${Math.round(91 + depth * 60)}, ${Math.round(143 - depth * 40)}, 255, ${alpha})`;
      context.lineWidth = 1.2;
      context.stroke();
    }
    if (p.strength > 0.02) {
      const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 60);
      glow.addColorStop(0, `rgba(140, 180, 255, ${0.28 * p.strength})`);
      glow.addColorStop(1, "rgba(140, 180, 255, 0)");
      context.fillStyle = glow;
      context.fillRect(p.x - 60, p.y - 60, 120, 120);
    }
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-between gap-2">
      <Hint>Tap for a pulse · drag to part</Hint>
      <canvas
        ref={canvasRef}
        aria-label="Interactive signal field. Tap to send pulses through the lines."
        role="img"
        className="h-full min-h-0 w-full flex-1 cursor-crosshair rounded-xl"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(event) => {
          const { x, y } = toLocal(event);
          ripples.current.push({ x, y, born: performance.now() / 1000 });
          if (ripples.current.length > 6) ripples.current.shift();
          pointer.current = { ...pointer.current, x, y, target: 1 };
          setPulses((count) => count + 1);
        }}
        onPointerMove={(event) => {
          const { x, y } = toLocal(event);
          pointer.current.x = x;
          pointer.current.y = y;
          if (event.pointerType === "mouse" || event.buttons > 0) pointer.current.target = 1;
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") pointer.current.target = 0;
        }}
        onPointerLeave={() => {
          pointer.current.target = 0;
        }}
      />
      <div className="flex items-center gap-2 text-[0.6rem] font-mono text-white/50">
        <span>Canvas 2D · live</span>
        <span>·</span>
        <span className="text-[var(--accent)]">
          {pulses} {pulses === 1 ? "pulse" : "pulses"} sent
        </span>
      </div>
    </div>
  );
}

/* ── 03. A real damped spring ── */

const SPRING_PRESETS = {
  snappy: { label: "Snappy", stiffness: 420, damping: 26 },
  wobbly: { label: "Wobbly", stiffness: 180, damping: 4 },
  soft: { label: "Soft", stiffness: 70, damping: 9 },
} as const;
type SpringPreset = keyof typeof SPRING_PRESETS;
const TRACE_LENGTH = 90;

function SpringPhysicsLab() {
  const stageRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLButtonElement>(null);
  const tetherRef = useRef<SVGLineElement>(null);
  const traceRef = useRef<SVGPolylineElement>(null);
  const [preset, setPreset] = useState<SpringPreset>("wobbly");
  const [moving, setMoving] = useState(false);
  const state = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    dragging: false,
    grabX: 0,
    grabY: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    trace: new Array<number>(TRACE_LENGTH).fill(0),
  });
  const inView = useLabActive(stageRef);

  const bounds = () => {
    const stage = stageRef.current;
    return stage
      ? { x: stage.clientWidth / 2 - 26, y: stage.clientHeight / 2 - 26 }
      : { x: 100, y: 50 };
  };

  const paint = () => {
    const s = state.current;
    if (puckRef.current) puckRef.current.style.transform = `translate(${s.x}px, ${s.y}px)`;
    tetherRef.current?.setAttribute("x2", String(s.x));
    tetherRef.current?.setAttribute("y2", String(s.y));
    if (traceRef.current) {
      traceRef.current.setAttribute(
        "points",
        s.trace.map((value, index) => `${(index / (TRACE_LENGTH - 1)) * 100},${12 - value * 11}`).join(" "),
      );
    }
  };

  useFrameLoop(inView && moving, (_time, delta) => {
    const s = state.current;
    const { stiffness, damping } = SPRING_PRESETS[preset];
    if (!s.dragging) {
      // Semi-implicit Euler in small steps keeps stiff springs stable.
      const steps = 4;
      const dt = delta / steps;
      for (let step = 0; step < steps; step += 1) {
        s.vx += (-stiffness * s.x - damping * s.vx) * dt;
        s.vy += (-stiffness * s.y - damping * s.vy) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      const limit = bounds();
      s.x = Math.max(-limit.x * 1.3, Math.min(limit.x * 1.3, s.x));
      s.y = Math.max(-limit.y * 1.3, Math.min(limit.y * 1.3, s.y));
    }
    const reach = bounds().x || 1;
    s.trace.push(Math.max(-1, Math.min(1, s.x / reach)));
    s.trace.shift();
    paint();
    const resting =
      !s.dragging && Math.abs(s.x) < 0.3 && Math.abs(s.y) < 0.3 && Math.abs(s.vx) < 2 && Math.abs(s.vy) < 2;
    if (resting && s.trace.every((value) => Math.abs(value) < 0.01)) {
      s.x = 0;
      s.y = 0;
      paint();
      setMoving(false);
    }
  });

  const kick = (vx: number, vy: number) => {
    state.current.vx += vx;
    state.current.vy += vy;
    setMoving(true);
  };

  // One flick the first time the card is seen, so it reads as alive.
  const introduced = useRef(false);
  useEffect(() => {
    if (!inView || introduced.current) return;
    introduced.current = true;
    const timer = window.setTimeout(() => {
      state.current.vx += 380;
      state.current.vy -= 140;
      setMoving(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [inView]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-between gap-2">
      <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
        {(Object.keys(SPRING_PRESETS) as SpringPreset[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={preset === key}
            onClick={() => {
              setPreset(key);
              kick(420, -160);
            }}
            className={`rounded-full px-3 py-1 text-[0.6rem] font-mono uppercase tracking-wider transition-colors ${
              preset === key ? "bg-[var(--accent)] text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {SPRING_PRESETS[key].label}
          </button>
        ))}
      </div>

      <div ref={stageRef} className="relative w-full flex-1">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <svg x="50%" y="50%" overflow="visible">
            <circle r={3} fill="rgba(255,255,255,0.45)" />
            <line ref={tetherRef} x1={0} y1={0} x2={0} y2={0} stroke="#5b8fff" strokeWidth={1.5} strokeDasharray="4 3" />
          </svg>
        </svg>
        <button
          ref={puckRef}
          type="button"
          aria-label="Spring puck. Drag and release it, or press the arrow keys to flick it."
          className="absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px] flex size-11 cursor-grab items-center justify-center rounded-full border border-[var(--accent)]/80 bg-gradient-to-br from-[#2a3f8c] to-[#0c132b] shadow-[0_0_28px_rgba(91,143,255,0.5)] active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={(event) => {
            const s = state.current;
            event.currentTarget.setPointerCapture(event.pointerId);
            s.dragging = true;
            s.grabX = event.clientX - s.x;
            s.grabY = event.clientY - s.y;
            s.lastX = event.clientX;
            s.lastY = event.clientY;
            s.lastT = performance.now();
            s.vx = 0;
            s.vy = 0;
            setMoving(true);
          }}
          onPointerMove={(event) => {
            const s = state.current;
            if (!s.dragging) return;
            const limit = bounds();
            s.x = Math.max(-limit.x, Math.min(limit.x, event.clientX - s.grabX));
            s.y = Math.max(-limit.y, Math.min(limit.y, event.clientY - s.grabY));
            const now = performance.now();
            const dt = Math.max(1, now - s.lastT) / 1000;
            s.vx = (event.clientX - s.lastX) / dt;
            s.vy = (event.clientY - s.lastY) / dt;
            s.lastX = event.clientX;
            s.lastY = event.clientY;
            s.lastT = now;
          }}
          onPointerUp={() => {
            state.current.dragging = false;
          }}
          onPointerCancel={() => {
            state.current.dragging = false;
          }}
          onKeyDown={(event) => {
            const impulse = event.shiftKey ? 900 : 500;
            const directions: Record<string, [number, number]> = {
              ArrowLeft: [-impulse, 0],
              ArrowRight: [impulse, 0],
              ArrowUp: [0, -impulse],
              ArrowDown: [0, impulse],
            };
            const direction = directions[event.key];
            if (!direction) return;
            event.preventDefault();
            kick(direction[0], direction[1]);
          }}
        >
          <span className="size-2 rounded-full bg-white shadow-[0_0_8px_#5b8fff]" />
        </button>
      </div>

      <div className="w-full max-w-[240px]">
        <svg aria-hidden="true" viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full">
          <line x1={0} x2={100} y1={12} y2={12} stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
          <polyline
            ref={traceRef}
            fill="none"
            stroke="#5b8fff"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            points={Array.from({ length: TRACE_LENGTH }, (_, index) => `${(index / (TRACE_LENGTH - 1)) * 100},12`).join(" ")}
          />
        </svg>
        <p className="mt-1 text-center text-[0.6rem] font-mono text-white/50">
          k {SPRING_PRESETS[preset].stiffness} · c {SPRING_PRESETS[preset].damping} ·{" "}
          <span className="text-[var(--accent)]">{moving ? "oscillating" : "at rest"}</span>
        </p>
      </div>
    </div>
  );
}

/* ── 04. One hue token, a whole component, contrast checked ── */

function oklchToLinearSrgb(lightness: number, chroma: number, hue: number) {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function contrastRatio(luminanceA: number, luminanceB: number) {
  const [light, dark] = luminanceA > luminanceB ? [luminanceA, luminanceB] : [luminanceB, luminanceA];
  return (light + 0.05) / (dark + 0.05);
}

const ACCENT_LIGHTNESS = 0.7;
const ACCENT_CHROMA = 0.16;
const INK_DARK_LUMINANCE = 0.0036; // #0b0b12

function DesignTokensLab() {
  const [hue, setHue] = useState(262);
  const [radius, setRadius] = useState<"sharp" | "soft" | "round">("soft");

  const [r, g, b] = oklchToLinearSrgb(ACCENT_LIGHTNESS, ACCENT_CHROMA, hue);
  const accentLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const onWhite = contrastRatio(accentLuminance, 1);
  const onDark = contrastRatio(accentLuminance, INK_DARK_LUMINANCE);
  const ink = onDark >= onWhite ? "#0b0b12" : "#ffffff";
  const ratio = Math.max(onWhite, onDark);
  const accent = `oklch(${ACCENT_LIGHTNESS * 100}% ${ACCENT_CHROMA} ${hue})`;
  const corner = radius === "sharp" ? "4px" : radius === "soft" ? "14px" : "999px";

  return (
    <div className="flex h-full w-full flex-col items-center justify-between gap-3">
      <div
        className="w-full max-w-[250px] border p-3 transition-[border-radius] duration-300"
        style={{
          borderRadius: radius === "round" ? "26px" : corner,
          borderColor: `oklch(${ACCENT_LIGHTNESS * 100}% ${ACCENT_CHROMA} ${hue} / 0.45)`,
          background: `linear-gradient(160deg, oklch(30% 0.06 ${hue} / 0.55), oklch(16% 0.03 ${hue} / 0.6))`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-medium text-white">Booking confirmed</span>
          <span
            className="px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider"
            style={{ background: `oklch(${ACCENT_LIGHTNESS * 100}% ${ACCENT_CHROMA} ${hue} / 0.18)`, color: accent, borderRadius: corner }}
          >
            Paid
          </span>
        </div>
        <p className="mt-1 text-[0.62rem] text-white/55">Marrakech · 2 nights · 2 guests</p>
        <div
          className="mt-3 py-2 text-center text-[0.7rem] font-semibold transition-colors"
          style={{ background: accent, color: ink, borderRadius: corner }}
        >
          View booking
        </div>
      </div>

      <div className="w-full max-w-[250px]">
        <input
          type="range"
          min={0}
          max={360}
          value={hue}
          aria-label="Accent hue"
          onChange={(event) => setHue(Number(event.target.value))}
          className="hue-range h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{
            touchAction: "pan-y",
            background:
              "linear-gradient(90deg, oklch(70% 0.16 0), oklch(70% 0.16 60), oklch(70% 0.16 120), oklch(70% 0.16 180), oklch(70% 0.16 240), oklch(70% 0.16 300), oklch(70% 0.16 360))",
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
            {(["sharp", "soft", "round"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={radius === option}
                onClick={() => setRadius(option)}
                className={`rounded-full px-2 py-0.5 text-[0.55rem] font-mono uppercase transition-colors ${
                  radius === option ? "bg-white text-black" : "text-white/55 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <span className={`text-[0.6rem] font-mono ${ratio >= 4.5 ? "text-emerald-300" : "text-amber-300"}`}>
            {ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "AA large"} {ratio.toFixed(1)}:1
          </span>
        </div>
        <p className="mt-2 truncate text-center text-[0.58rem] font-mono text-white/45">
          --accent: oklch(70% 0.16 {hue})
        </p>
      </div>
    </div>
  );
}

/* ── 05. Slide to confirm ── */

const KNOB = 40;
const TRACK_PADDING = 4;

function GestureSliderLab() {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = useState(180);
  const [complete, setComplete] = useState(false);
  const drag = useRef<{ startX: number; startValue: number } | null>(null);
  const fill = useTransform(x, (value) => value + KNOB + TRACK_PADDING);
  const labelOpacity = useTransform(x, [0, maxX * 0.6], [1, 0]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setMaxX(Math.max(60, track.clientWidth - KNOB - TRACK_PADDING * 2));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const confirm = useCallback(() => {
    setComplete(true);
    animate(x, maxX, { type: "spring", stiffness: 500, damping: 36 });
    try {
      navigator.vibrate?.(14);
    } catch {
      // Vibration is a nicety; some browsers refuse it.
    }
  }, [maxX, x]);

  useEffect(() => {
    if (!complete) return;
    const timer = window.setTimeout(() => {
      setComplete(false);
      animate(x, 0, { type: "spring", stiffness: 260, damping: 26 });
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [complete, x]);

  const release = () => {
    if (!drag.current) return;
    drag.current = null;
    if (x.get() >= maxX * 0.88) confirm();
    else animate(x, 0, { type: "spring", stiffness: 520, damping: 22 });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <Hint>{complete ? "Payment sent" : "Slide right to pay"}</Hint>

      <div className="w-full max-w-[260px]">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-white/45">Total</span>
          <span className="display text-2xl text-white">1 240 MAD</span>
        </div>
        <div
          ref={trackRef}
          className={`relative h-12 w-full overflow-hidden rounded-full border transition-colors duration-500 ${
            complete ? "border-emerald-400/60 bg-emerald-400/10" : "border-white/15 bg-white/5"
          }`}
        >
          <motion.div
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 rounded-full ${
              complete ? "bg-emerald-400/30" : "bg-gradient-to-r from-[var(--accent)]/15 to-[var(--accent)]/50"
            }`}
            style={{ width: fill }}
          />
          <motion.span
            aria-hidden="true"
            style={{ opacity: complete ? 0 : labelOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center pl-8 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-white/55"
          >
            Slide to pay →
          </motion.span>
          {complete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center pr-8 text-[0.7rem] font-mono font-semibold uppercase tracking-[0.2em] text-emerald-300"
            >
              Confirmed
            </motion.span>
          )}
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label="Slide to pay"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={complete ? 100 : 0}
            aria-valuetext={complete ? "Payment confirmed" : "Not confirmed. Press Enter to confirm."}
            className={`absolute top-1 flex cursor-grab items-center justify-center rounded-full text-sm font-bold shadow-[0_0_18px_rgba(255,255,255,0.35)] active:cursor-grabbing ${
              complete ? "bg-emerald-300 text-black" : "bg-white text-black"
            }`}
            style={{ x, left: TRACK_PADDING, width: KNOB, height: KNOB, touchAction: "pan-y" }}
            onPointerDown={(event) => {
              if (complete) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { startX: event.clientX, startValue: x.get() };
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              const next = drag.current.startValue + event.clientX - drag.current.startX;
              // Resistance past the end, so the track feels physical.
              x.set(next > maxX ? maxX + (next - maxX) * 0.15 : Math.max(0, next));
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onKeyDown={(event) => {
              if (complete) return;
              if (event.key === "Enter" || event.key === " " || event.key === "End") {
                event.preventDefault();
                confirm();
              }
            }}
          >
            {complete ? "✓" : "→"}
          </motion.div>
        </div>
      </div>

      <span className={`text-[0.6rem] font-mono ${complete ? "text-emerald-300" : "text-white/45"}`}>
        {complete ? "Receipt sent · resets in a moment" : "Release early and it springs back"}
      </span>
    </div>
  );
}

function Card({ slide }: { slide: Slide }) {
  return (
    <div
      data-lab-card
      className="group relative flex h-[30rem] w-[84vw] max-w-[24rem] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-[var(--hairline)] p-5 transition-[border-color,box-shadow] duration-500 hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(91,143,255,0.06)] sm:h-[32rem] sm:w-[48vw] sm:max-w-none sm:p-7 lg:w-[34vw]"
      style={{ background: slide.tone }}
    >
      <Grain id={slide.index} />

      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <span className="serif accent text-lg italic">{slide.index}</span>
          <span className="label-caps text-[0.62rem] tracking-[0.2em] text-faint">Fragment</span>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.58rem] font-mono uppercase tracking-wider text-white/60">
          {slide.gesture}
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 py-4">
        {slide.index === "01" && <TypeStudiesLab />}
        {slide.index === "02" && <SignalFieldLab />}
        {slide.index === "03" && <SpringPhysicsLab />}
        {slide.index === "04" && <DesignTokensLab />}
        {slide.index === "05" && <GestureSliderLab />}
      </div>

      <div className="relative z-10 border-t border-white/5 pt-3">
        <h3 className="display text-xl font-normal tracking-tight text-white sm:text-2xl">{slide.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/55">{slide.tag}</p>
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
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-stretch gap-6 px-6 sm:px-12">
          {SLIDES.map((slide) => (
            <Card key={slide.index} slide={slide} />
          ))}
        </motion.div>
        <p className="label-caps mt-6 px-6 text-faint sm:px-12">Scroll — the wall moves sideways</p>
      </div>
    </div>
  );
}

function Native() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const cards = () => Array.from(scrollerRef.current?.querySelectorAll<HTMLElement>("[data-lab-card]") ?? []);

  const goTo = (index: number) => {
    const scroller = scrollerRef.current;
    const card = cards()[index];
    if (!scroller || !card) return;
    scroller.scrollTo({
      left: card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:px-12 [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const scroller = event.currentTarget;
          const middle = scroller.scrollLeft + scroller.clientWidth / 2;
          let nearest = 0;
          cards().forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
            const best = Math.abs(cards()[nearest].offsetLeft + cards()[nearest].offsetWidth / 2 - middle);
            if (distance < best) nearest = index;
          });
          if (nearest !== current) setCurrent(nearest);
        }}
      >
        {SLIDES.map((slide) => (
          <Card key={slide.index} slide={slide} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between px-6 sm:px-12">
        <div className="flex gap-2" role="tablist" aria-label="Lab fragments">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.index}
              type="button"
              role="tab"
              aria-selected={current === index}
              aria-label={`Fragment ${slide.index}: ${slide.title}`}
              onClick={() => goTo(index)}
              className="flex h-6 items-center"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 ${
                  current === index ? "w-6 bg-[var(--accent)]" : "w-2 bg-white/25"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous fragment"
            disabled={current === 0}
            onClick={() => goTo(current - 1)}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-opacity disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next fragment"
            disabled={current === SLIDES.length - 1}
            onClick={() => goTo(current + 1)}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-opacity disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const reduce = useReducedMotionPreference();
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
    <section id="lab" aria-label="Visual lab" className="relative py-24 sm:py-36">
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
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
            Five small experiments in how an interface should feel: type, signal, physics, tokens and gesture. Every one is live. Touch them.
          </p>
        </Reveal>
      </div>

      {pinned ? <Pinned /> : <Native />}
    </section>
  );
}
