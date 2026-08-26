"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ScrollVideo = dynamic(() => import("../media/ScrollVideo"), {
  ssr: false,
});
const ScrollVideoFallback = dynamic(
  () => import("../media/ScrollVideoFallback"),
  { ssr: false }
);

export default function BackgroundScene() {
  const [mode, setMode] = useState<"loading" | "mobile" | "desktop">(
    "loading"
  );

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMq = window.matchMedia("(max-width: 767px)");

    const sync = () => {
      setMode(reduceMq.matches || mobileMq.matches ? "mobile" : "desktop");
    };

    const raf = requestAnimationFrame(sync);
    mobileMq.addEventListener("change", sync);
    reduceMq.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      mobileMq.removeEventListener("change", sync);
      reduceMq.removeEventListener("change", sync);
    };
  }, []);

  if (mode === "loading") return null;

  if (mode === "mobile") {
    return <ScrollVideoFallback poster="/media/universe-poster.jpg" />;
  }

  return (
    <ScrollVideo
      src="/media/universe.mp4"
      poster="/media/universe-poster.jpg"
      overlayOpacity={0.55}
    />
  );
}
