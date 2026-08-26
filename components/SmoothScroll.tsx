"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { scrollBus, setLenis } from "./lenis-bridge";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    // On touch devices (iPhone, iPad, Android), rely on native iOS momentum scrolling
    if (isReduced || isTouch) {
      const onNativeScroll = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const current = window.scrollY;
        scrollBus.y = current;
        scrollBus.progress = total > 0 ? current / total : 0;
      };
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      onNativeScroll();
      return () => window.removeEventListener("scroll", onNativeScroll);
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
