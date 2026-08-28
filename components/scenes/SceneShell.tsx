"use client";

import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type SceneStatus = "loading" | "active" | "static" | "failed";

type SceneShellProps = {
  name: string;
  reducedMotion: boolean;
  children: (setStatus: Dispatch<SetStateAction<SceneStatus>>) => ReactNode;
};

const STATIC_GATES = [16, 28, 42, 58, 76];

function JourneyFallback({ subdued }: { subdued: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 transition-opacity duration-700 ${subdued ? "opacity-25" : "opacity-100"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(91,143,255,0.14),transparent_20%),radial-gradient(circle_at_62%_52%,rgba(157,123,255,0.1),transparent_32%),#030610]" />
      <div className="absolute inset-0 [perspective:900px]">
        {STATIC_GATES.map((size, index) => (
          <div
            key={size}
            className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6f8fff]/15"
            style={{
              width: `${size}vmin`,
              transform: `translate(-50%, -50%) rotateX(${index * 2}deg) rotateY(${index * -3}deg)`,
            }}
          />
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 h-px w-[70vmin] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] bg-gradient-to-r from-transparent via-[#8ba9ff]/40 to-transparent shadow-[0_0_18px_rgba(91,143,255,0.45)]" />
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
