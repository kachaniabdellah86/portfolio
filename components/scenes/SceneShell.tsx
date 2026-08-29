"use client";

import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type SceneStatus = "loading" | "active" | "static" | "failed";

type SceneShellProps = {
  name: string;
  reducedMotion: boolean;
  children: (setStatus: Dispatch<SetStateAction<SceneStatus>>) => ReactNode;
};

function JourneyFallback({ subdued }: { subdued: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 transition-opacity duration-700 ${subdued ? "opacity-25" : "opacity-100"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_42%,rgba(91,143,255,0.16),transparent_20%),radial-gradient(circle_at_68%_58%,rgba(255,113,91,0.08),transparent_28%),#02040b]" />
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full opacity-70"
      >
        <defs>
          <linearGradient id="fallback-signal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5b8fff" stopOpacity="0" />
            <stop offset="24%" stopColor="#5b8fff" />
            <stop offset="64%" stopColor="#9d7bff" />
            <stop offset="100%" stopColor="#ff9b67" stopOpacity="0" />
          </linearGradient>
          <filter id="fallback-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path
          d="M -80 520 C 170 540 235 245 420 330 S 690 510 820 320 S 1110 155 1280 260"
          fill="none"
          stroke="url(#fallback-signal)"
          strokeWidth="2"
          filter="url(#fallback-glow)"
        />
        {[160, 420, 690, 900, 1120].map((x, index) => (
          <g key={x} opacity={0.22 + index * 0.08}>
            <circle cx={x} cy={[490, 330, 440, 270, 220][index]} r={9 + index * 2} fill="none" stroke="#a9bdff" />
            <circle cx={x} cy={[490, 330, 440, 270, 220][index]} r="3" fill="#e9efff" />
          </g>
        ))}
      </svg>
      <div className="absolute left-[42%] top-[42%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7fa5ff]/15 bg-[radial-gradient(circle,rgba(218,230,255,0.2),rgba(91,143,255,0.04)_36%,transparent_70%)] shadow-[0_0_80px_rgba(91,143,255,0.16)]" />
    </div>
  );
}

export default function SceneShell({
  name,
  reducedMotion,
  children,
}: SceneShellProps) {
  const [runtimeStatus, setRuntimeStatus] = useState<SceneStatus>("loading");
  const status = reducedMotion ? "static" : runtimeStatus;

  return (
    <div
      aria-hidden="true"
      data-scene={name}
      data-scene-status={status}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030610]"
    >
      <JourneyFallback subdued={status === "active"} />
      {!reducedMotion && children(setRuntimeStatus)}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(3,6,16,0.18)_70%,rgba(3,6,16,0.65)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030610]/25 via-transparent to-[#030610]/85" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(232,230,225,0.3)_0.55px,transparent_0.55px)] [background-size:5px_5px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)]" />
    </div>
  );
}
