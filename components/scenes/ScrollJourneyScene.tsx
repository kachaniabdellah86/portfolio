"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { scrollBus } from "../lenis-bridge";
import type { SceneStatus } from "./SceneShell";
import {
  createScrollJourneyRenderer,
  SCROLL_JOURNEY_DEFAULTS,
  type ScrollJourneyOptions,
} from "./scrollJourneyRenderer";

type ScrollJourneySceneProps = {
  setStatus: Dispatch<SetStateAction<SceneStatus>>;
};

function getScenePhase(progress: number) {
  if (progress < 0.18) return "arrival";
  if (progress < 0.4) return "kachanios";
  if (progress < 0.64) return "aura-pay";
  if (progress < 0.86) return "yalla-china";
  return "contact";
}

export default function ScrollJourneyScene({ setStatus }: ScrollJourneySceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let animationFrame = 0;
    let contextAvailable = true;
    let lastPhase = "";
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const options: ScrollJourneyOptions = {
      ...SCROLL_JOURNEY_DEFAULTS,
      quality: compact ? "compact" : "full",
    };

    let journey: ReturnType<typeof createScrollJourneyRenderer>;
    try {
      journey = createScrollJourneyRenderer(canvas, () => options);
    } catch {
      setStatus("failed");
      return;
    }

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      journey.resize(bounds.width, bounds.height);
      journey.render(performance.now());
    };
    const tick = (timestamp: number) => {
      options.progress = scrollBus.journeyProgress;
      options.velocity = scrollBus.velocity;
      const phase = getScenePhase(options.progress);
      if (phase !== lastPhase) {
        canvas.dataset.scenePhase = phase;
        lastPhase = phase;
      }
      journey.render(timestamp);
      animationFrame =
        !document.hidden && contextAvailable ? requestAnimationFrame(tick) : 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      journey.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextAvailable = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      setStatus("failed");
    };
    const onVisibilityChange = () => {
      if (!document.hidden && contextAvailable && !animationFrame) {
        animationFrame = requestAnimationFrame(tick);
      }
    };
    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    resize();
    setStatus("active");
    animationFrame = requestAnimationFrame(tick);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      journey.dispose();
    };
  }, [setStatus]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        data-renderer="scroll-journey"
        className="block size-full"
      />
    </div>
  );
}
