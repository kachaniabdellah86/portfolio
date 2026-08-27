"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";

type CursorState = {
  type: "default" | "pointer" | "view" | "explore" | "drag";
  text?: string;
};

const FINE_POINTER_QUERY =
  "(pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeToFinePointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getServerFinePointerSnapshot() {
  return false;
}

export default function Cursor() {
  const enabled = useSyncExternalStore(
    subscribeToFinePointer,
    getFinePointerSnapshot,
    getServerFinePointerSnapshot,
  );
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>({ type: "default" });
  const [pressed, setPressed] = useState(false);

  // Exact 1:1 instantaneous coordinates for the center precision dot
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Smooth trailing spring coordinates for the outer aura / badge
  const ringX = useSpring(-100, { stiffness: 380, damping: 30, mass: 0.5 });
  const ringY = useSpring(-100, { stiffness: 380, damping: 30, mass: 0.5 });

  const isInitialized = useRef(false);
  const visibleRef = useRef(false);
  const cursorStateRef = useRef<CursorState>({ type: "default" });

  useEffect(() => {
    if (!enabled) return;

    const updateVisibility = (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) return;
      visibleRef.current = nextVisible;
      setVisible(nextVisible);
    };

    const updateCursorState = (nextState: CursorState) => {
      const currentState = cursorStateRef.current;
      if (currentState.type === nextState.type && currentState.text === nextState.text) return;
      cursorStateRef.current = nextState;
      setCursorState(nextState);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isInitialized.current) {
        isInitialized.current = true;
        dotX.set(e.clientX);
        dotY.set(e.clientY);
        ringX.jump(e.clientX);
        ringY.jump(e.clientY);
      } else {
        dotX.set(e.clientX);
        dotY.set(e.clientY);
        ringX.set(e.clientX);
        ringY.set(e.clientY);
      }

      updateVisibility(true);

      // Detect cursor context based on hovered DOM elements
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Direct interactive controls (buttons, inputs, clickable links) ALWAYS take highest priority
      const isClickable = target.closest<HTMLElement>(
        "a, button, input, textarea, select, [role='button']"
      );

      if (isClickable) {
        updateCursorState({ type: "pointer" });
        return;
      }

      // 2. Custom badges (only when hovering background/card links, not micro-controls)
      const customCursorEl = target.closest<HTMLElement>("[data-cursor]");
      if (customCursorEl) {
        const cursorAttr = customCursorEl.dataset.cursor;
        if (cursorAttr === "view") {
          updateCursorState({ type: "view", text: "VIEW ↗" });
          return;
        }
        if (cursorAttr === "explore") {
          updateCursorState({ type: "explore", text: "EXPLORE ✦" });
          return;
        }
        if (cursorAttr === "drag") {
          updateCursorState({ type: "drag", text: "DRAG ↔" });
          return;
        }
      }

      updateCursorState({ type: "default" });
    };

    const onMouseDown = () => setPressed(true);
    const onMouseUp = () => setPressed(false);
    const onMouseLeave = () => updateVisibility(false);
    const onMouseEnter = () => updateVisibility(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [dotX, dotY, enabled, ringX, ringY]);

  if (!enabled) return null;

  const isView = cursorState.type === "view";
  const isExplore = cursorState.type === "explore" || cursorState.type === "drag";
  const isPointer = cursorState.type === "pointer";
  const isBadge = isView || isExplore;

  return (
    <>
      {/* ── 1. Center Precision Dot (Instant 1:1 Tracking) ── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[999] will-change-transform"
        style={{
          x: dotX,
          y: dotY,
          opacity: visible && !isBadge ? 1 : 0,
        }}
      >
        <motion.div
          className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_#5b8fff]"
          animate={{
            scale: pressed ? 0.7 : isPointer ? 0 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      {/* ── 2. Outer Inertia Aura / Frosted Badge (Spring Trailing) ── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[998] will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          opacity: visible ? 1 : 0,
        }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden rounded-full will-change-transform"
          animate={{
            width: isView ? 94 : isExplore ? 110 : isPointer ? 46 : 28,
            height: isBadge ? 34 : isPointer ? 46 : 28,
            scale: pressed ? 0.88 : 1,
            backgroundColor: isView
              ? "rgba(8, 11, 24, 0.88)"
              : isExplore
              ? "rgba(14, 14, 12, 0.88)"
              : isPointer
              ? "rgba(91, 143, 255, 0.14)"
              : "rgba(91, 143, 255, 0.03)",
            borderColor: isView
              ? "rgba(91, 143, 255, 0.6)"
              : isExplore
              ? "rgba(232, 230, 225, 0.35)"
              : isPointer
              ? "rgba(91, 143, 255, 0.55)"
              : "rgba(232, 230, 225, 0.22)",
            boxShadow: isView
              ? "0 0 24px rgba(91, 143, 255, 0.3), inset 0 0 12px rgba(91, 143, 255, 0.15)"
              : isPointer
              ? "0 0 16px rgba(91, 143, 255, 0.2)"
              : "0 0 0px transparent",
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 26,
            mass: 0.6,
          }}
          style={{
            borderWidth: "1px",
            backdropFilter: isBadge ? "blur(12px)" : "none",
            WebkitBackdropFilter: isBadge ? "blur(12px)" : "none",
          }}
        >
          <AnimatePresence mode="wait">
            {isBadge && (
              <motion.span
                key={cursorState.text}
                initial={{ opacity: 0, scale: 0.8, y: 3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -3 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`label-caps whitespace-nowrap text-[0.65rem] font-semibold tracking-[0.2em] select-none ${
                  isView ? "text-[var(--accent)]" : "text-white"
                }`}
              >
                {cursorState.text}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
