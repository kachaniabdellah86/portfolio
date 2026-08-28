"use client";

import dynamic from "next/dynamic";
import SceneShell from "../scenes/SceneShell";
import { useReducedMotionPreference } from "../use-reduced-motion";

const ScrollJourneyScene = dynamic(() => import("../scenes/ScrollJourneyScene"), {
  ssr: false,
});

export default function BackgroundScene() {
  const reduceMotion = useReducedMotionPreference();

  return (
    <SceneShell name="scroll-journey" reducedMotion={reduceMotion}>
      {(setStatus) => <ScrollJourneyScene setStatus={setStatus} />}
    </SceneShell>
  );
}
