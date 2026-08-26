"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { scrollBus, setLenis } from "./lenis-bridge";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.09 });
    setLenis(lenis);

    const writeBus = (e: {
      scroll: number;
      velocity: number;
      progress: number;
    }) => {
      scrollBus.y = e.scroll;
      scrollBus.velocity = e.velocity;
      scrollBus.progress = e.progress;
    };
    lenis.on("scroll", writeBus);

    let raf = 0;

    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.off("scroll", writeBus);
      lenis.destroy();
      setLenis(undefined);
    };
  }, []);

  return <>{children}</>;
}
