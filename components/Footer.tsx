"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "motion/react";
import { whatsappUrl } from "@/lib/site";
import { Reveal } from "./Marquee";

/* ── Split-hover effect using the already-installed split-type package ── */
function SplitHoverLink() {
  const ref = useRef<HTMLAnchorElement>(null);
  const magX = useSpring(0, { stiffness: 150, damping: 15 });
  const magY = useSpring(0, { stiffness: 150, damping: 15 });

  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    magX.set((e.clientX - (r.left + r.width / 2)) * 0.03);
    magY.set((e.clientY - (r.top + r.height / 2)) * 0.06);
  };

  const onPointerLeave = () => {
    magX.set(0);
    magY.set(0);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let instance: InstanceType<typeof import("split-type").default> | null = null;
    let cancelled = false;
    let removeListeners = () => {};

    import("split-type").then(({ default: ST }) => {
      if (cancelled) return;

      instance = new ST(el, { types: "chars" });

      const chars = el.querySelectorAll<HTMLElement>(".char");
      chars.forEach((char, i) => {
        char.style.display = "inline-block";
        char.style.transition = `transform 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.018}s, opacity 0.3s ease ${i * 0.018}s`;
        char.style.willChange = "transform";
      });

      const onEnter = () => {
        chars.forEach((char) => {
          char.style.transform = "translateY(-100%)";
          char.style.opacity = "0.4";
        });
      };
      const onLeave = () => {
        chars.forEach((char) => {
          char.style.transform = "translateY(0)";
          char.style.opacity = "1";
        });
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);

      removeListeners = () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      cancelled = true;
      removeListeners();
      instance?.revert();
    };
  }, []);

  return (
    <motion.a
      ref={ref}
      href="mailto:abdellah.kachani@e-polytechnique.ma"
      aria-label="Email Abdellah Kachani"
      data-cursor="view"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x: magX, y: magY }}
      className="display mt-6 block overflow-hidden text-[clamp(2.6rem,8vw,7.5rem)] leading-none tracking-tight transition-colors hover:text-[var(--accent)]"
    >
      Let&apos;s <span className="text-outline">create </span>
      <br />
      something{" "}
      <em className="serif accent text-[1.05em] italic">together.</em>
    </motion.a>
  );
}

function CopyEmailButton() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<number | null>(null);
  const copyAttempt = useRef(0);

  useEffect(() => () => {
    copyAttempt.current += 1;
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  const handleCopy = async () => {
    const attempt = ++copyAttempt.current;
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText("abdellah.kachani@e-polytechnique.ma");
      if (attempt !== copyAttempt.current) return;
      setCopyState("copied");
    } catch {
      if (attempt !== copyAttempt.current) return;
      setCopyState("error");
    }

    resetTimer.current = window.setTimeout(() => {
      setCopyState("idle");
      resetTimer.current = null;
    }, 2400);
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-md transition-all hover:border-[var(--accent)]/60 hover:bg-white/10 cursor-pointer"
    >
      <span className="font-mono text-xs text-white/80 transition-colors group-hover:text-white">
        abdellah.kachani@e-polytechnique.ma
      </span>
      <span
        aria-live="polite"
        className={`rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider transition-all ${
          copyState === "copied"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            : copyState === "error"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            : "bg-white/10 text-muted group-hover:text-white"
        }`}
      >
        {copyState === "copied" ? "COPIED ✓" : copyState === "error" ? "RETRY" : "COPY"}
      </span>
    </button>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="hairline-t px-6 pb-12 pt-24 sm:px-12 sm:pt-36">
      <Reveal>
        <p className="label-caps accent">Contact</p>
      </Reveal>

      <Reveal delay={0.08}>
        <SplitHoverLink />
      </Reveal>

      <Reveal delay={0.16}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(91,143,255,0.3)] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.8 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" />
            </svg>
            WhatsApp me
          </a>
          <CopyEmailButton />
        </div>
      </Reveal>

      <div className="hairline-t mt-20 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label-caps text-muted">© 2026 Abdellah Kachani</p>
        <div className="flex flex-wrap gap-6 sm:gap-8">
          {[
            { label: "LinkedIn", href: "https://www.linkedin.com/in/abdellah-kachani-8284a5251/" },
            { label: "GitHub", href: "https://github.com/kachaniabdellah86" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps text-muted transition-colors hover:text-[var(--ink)]"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
