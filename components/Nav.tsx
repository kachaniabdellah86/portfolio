"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { EASE_OUT } from "./tokens";
import { useReducedMotionPreference } from "./use-reduced-motion";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Lab", href: "#lab" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const reduce = useReducedMotionPreference();
  const [visible, setVisible] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const lastY = useRef(0);
  const [ticks, setTicks] = useState<number[]>([]);

  useEffect(() => {
    const calc = () => {
      const dh = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      setTicks(
        ["#work", "#lab", "#services", "#contact"].map((sel) => {
          const el = document.querySelector<HTMLElement>(sel);
          if (!el) return 0;
          return (
            ((el.getBoundingClientRect().top + window.scrollY) / dh) * 100
          );
        })
      );
    };
    const raf = requestAnimationFrame(calc);
    window.addEventListener("resize", calc);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", calc);
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(window.scrollY > window.innerHeight * 0.55);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const goingDown = y > lastY.current;
    lastY.current = y;
    setVisible(y > window.innerHeight * 0.55 && !goingDown);
  });

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(target, { offset: -96, immediate: Boolean(reduce) });
    } else if (reduce) {
      target.scrollIntoView();
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[80] flex justify-center px-4">
      <motion.nav
        aria-label="Primary"
        initial={false}
        animate={{
          y: visible ? 0 : -72,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
        className="pointer-events-auto relative rounded-full border border-[var(--hairline)] bg-[rgba(14,14,12,0.72)] backdrop-blur-md"
      >
        <div className="flex items-center gap-1 px-2 py-2">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              const lenis = window.__lenis;
              if (lenis) {
                lenis.scrollTo(0, { immediate: Boolean(reduce) });
              } else {
                window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
              }
            }}
            className="display mr-2 px-3 text-lg tracking-tight text-[var(--ink)]"
            aria-label="Back to top"
          >
            AK<span className="accent">.</span>
          </a>

          <span className="h-4 w-px bg-[var(--hairline)]" aria-hidden="true" />

          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => onLinkClick(e, link.href)}
              className="label-caps rounded-full px-4 py-2 text-muted transition-colors hover:bg-[rgba(91,143,255,0.08)] hover:text-[var(--ink)]"
            >
              {link.label}
            </a>
          ))}

          <span className="ml-1 hidden items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-2 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            <span className="label-caps text-muted">Open to work</span>
          </span>
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute inset-x-5 bottom-0 h-px origin-left bg-[var(--accent)]"
          style={{ scaleX: progress }}
        />

        {ticks.map((t, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute bottom-[-2.5px] h-[6px] w-px bg-[var(--faint)]"
            style={{ left: `calc(20px + (100% - 40px) * ${Math.min(Math.max(t, 0), 100) / 100})` }}
          />
        ))}
      </motion.nav>
    </div>
  );
}
