"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { scrollBus } from "../lenis-bridge";
import type { SceneStatus } from "./SceneShell";
import {
  createScrollJourneyRenderer,
  SCROLL_JOURNEY_DEFAULTS,
  type ScrollJourneyOptions,
} from "./scrollJourneyRenderer";
import { shouldRunJourney } from "./renderQuality";

type ScrollJourneySceneProps = {
  setStatus: Dispatch<SetStateAction<SceneStatus>>;
};

function getScenePhase(progress: number) {
  if (progress < 0.18) return "spark";
  if (progress < 0.4) return "kachanios";
  if (progress < 0.64) return "aura-pay";
  if (progress < 0.86) return "yalla-china";
  return "horizon";
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
    let ready = false;
    let disposed = false;
    let lastPhase = "";
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const options: ScrollJourneyOptions = {
      ...SCROLL_JOURNEY_DEFAULTS,
      quality: compact ? "compact" : "full",
    };

    let journey: Awaited<ReturnType<typeof createScrollJourneyRenderer>> | null = null;

    const resize = () => {
      if (!journey) return;
      const bounds = host.getBoundingClientRect();
      journey.resize(bounds.width, bounds.height);
    };
    const canRun = () =>
      ready &&
      shouldRunJourney({
        contextAvailable,
        documentHidden: document.hidden,
        journeyVisible: scrollBus.journeyVisible,
      });
    const tick = (timestamp: number) => {
      animationFrame = 0;
      if (!canRun() || !journey) return;
      options.progress = scrollBus.journeyProgress;
      options.velocity = scrollBus.velocity;
      const phase = getScenePhase(options.progress);
      if (phase !== lastPhase) {
        canvas.dataset.scenePhase = phase;
        lastPhase = phase;
      }
      journey.render(timestamp);
      animationFrame = requestAnimationFrame(tick);
    };
    const syncAnimationLoop = () => {
      if (canRun() && !animationFrame) {
        animationFrame = requestAnimationFrame(tick);
      } else if (!canRun() && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      journey?.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextAvailable = false;
      syncAnimationLoop();
      setStatus("failed");
    };
    const onContextRestored = () => {
      contextAvailable = true;
      syncAnimationLoop();
      setStatus("active");
    };
    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("journey-visibility-change", syncAnimationLoop);
    document.addEventListener("visibilitychange", syncAnimationLoop);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    // The scene builds in small steps so the page keeps responding to touch,
    // and the static fallback stays up until every shader is compiled, so the
    // first scroll through the chapters never stalls on a compile.
    createScrollJourneyRenderer(canvas, () => options)
      .then(async (built) => {
        if (disposed) {
          built.dispose();
          return;
        }
        journey = built;
        resize();
        await built.warmup().catch(() => {});
        if (disposed) return;
        ready = true;
        setStatus("active");
        syncAnimationLoop();
      })
      .catch(() => {
        if (!disposed) setStatus("failed");
      });

    return () => {
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("journey-visibility-change", syncAnimationLoop);
      document.removeEventListener("visibilitychange", syncAnimationLoop);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      journey?.dispose();
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
