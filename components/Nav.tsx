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
import { useLocale } from "./LocaleProvider";

export default function Nav() {
  const reduce = useReducedMotionPreference();
  const { lang, dict } = useLocale();
  const t = dict.nav;
  const otherLang = lang === "fr" ? "en" : "fr";
  // Visible from the first paint: a visitor should always see where to go.
  const [visible, setVisible] = useState(true);

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
        t.links.map(({ href: sel }) => {
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
  }, [t.links]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const goingDown = y > lastY.current;
    lastY.current = y;
    setVisible(y < window.innerHeight * 0.55 || !goingDown);
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
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[80] flex justify-center px-3 sm:px-4">
      <motion.nav
        aria-label={t.label}
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
            className="display mr-1 px-2 text-lg tracking-tight text-[var(--ink)] sm:mr-2 sm:px-3"
            aria-label={t.backToTop}
          >
            AK<span className="accent">.</span>
          </a>

          <span className="hidden h-4 w-px bg-[var(--hairline)] sm:block" aria-hidden="true" />

          {t.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => onLinkClick(e, link.href)}
              // Phones get tighter padding and drop "Lab" so the pill fits a 360px screen.
              className={`label-caps rounded-full px-2 py-2 text-muted transition-colors hover:bg-[rgba(91,143,255,0.08)] hover:text-[var(--ink)] sm:px-4 ${
                link.phone ? "" : "hidden sm:inline"
              }`}
            >
              {link.label}
            </a>
          ))}

          <span className="ml-1 hidden items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-2 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            <span className="label-caps text-muted">{t.available}</span>
          </span>

          <a
            href={`/${otherLang}`}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={t.switchLabel}
            className="label-caps ml-0.5 rounded-full border border-[var(--hairline)] px-2.5 py-2 text-[var(--ink)] sm:ml-1 sm:px-3 transition-colors hover:border-[var(--accent)]"
          >
            {otherLang.toUpperCase()}
          </a>
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
