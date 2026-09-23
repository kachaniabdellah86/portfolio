"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import SceneShell from "../scenes/SceneShell";
import { useReducedMotionPreference } from "../use-reduced-motion";

const ScrollJourneyScene = dynamic(() => import("../scenes/ScrollJourneyScene"), {
  ssr: false,
});

const START_EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
const SETTLE_DELAY_MS = 2500;

/**
 * Holds the WebGL scene back until the page is already readable. Building the
 * scene costs seconds of main-thread time on mid-range phones, so it starts on
 * the visitor's first interaction, or once the page has settled after load.
 * The static fallback in SceneShell covers the gap.
 */
function useSceneStart() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;

    let timer = 0;
    const start = () => setStarted(true);
    const settle = () => {
      timer = window.setTimeout(start, SETTLE_DELAY_MS);
    };

    START_EVENTS.forEach((type) => window.addEventListener(type, start, { passive: true, once: true }));
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });

    return () => {
      START_EVENTS.forEach((type) => window.removeEventListener(type, start));
      window.removeEventListener("load", settle);
      window.clearTimeout(timer);
    };
  }, [started]);

  return started;
}

export default function BackgroundScene() {
  const reduceMotion = useReducedMotionPreference();
  const started = useSceneStart();

  return (
    <SceneShell name="scroll-journey" reducedMotion={reduceMotion}>
      {(setStatus) => (started ? <ScrollJourneyScene setStatus={setStatus} /> : null)}
    </SceneShell>
  );
}
