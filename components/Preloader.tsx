"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  EASE_OUT,
  PRELOAD_COUNT_MS,
  PRELOAD_HOLD_MS,
} from "./tokens";

export default function Preloader() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      const raf = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(raf);
    }

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const p = Math.min((now - start) / PRELOAD_COUNT_MS, 1);
      setCount(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        holdTimer = setTimeout(() => {
          setDone(true);
          document.body.style.overflow = "";
        }, PRELOAD_HOLD_MS);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (holdTimer) clearTimeout(holdTimer);
      document.body.style.overflow = "";
    };
  }, [reduce]);

  useEffect(() => {
    if (done) {
      document.body.style.overflow = "";
    }
  }, [done]);

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg)]"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {reduce ? (
            <p className="serif text-4xl tracking-tight">
              Abdellah <span className="accent italic">Kachani</span>
            </p>
          ) : (
            <>
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                  className="display text-[clamp(2rem,7vw,4.5rem)] leading-none tracking-tight"
                >
                  Abdellah{" "}
                  <span className="serif italic accent">Kachani</span>
                </motion.p>
              </div>

              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: "120%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 0.9,
                    ease: EASE_OUT,
                    delay: 0.12,
                  }}
                  className="label-caps text-muted mt-4"
                >
                  UI/UX Designer
                </motion.p>
              </div>

              <div className="absolute bottom-8 left-0 w-full px-8 sm:px-12">
                <div className="flex items-end justify-between">
                  <div className="h-px flex-1 bg-[var(--hairline)]">
                    <motion.div
                      className="h-px origin-left bg-[var(--accent)]"
                      style={{ scaleX: count / 100 }}
                    />
                  </div>
                  <span className="ml-4 text-sm tabular-nums text-muted">
                    {count}%
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
