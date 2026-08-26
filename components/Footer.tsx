"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring } from "motion/react";
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

    import("split-type").then(({ default: ST }) => {
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

      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      instance?.revert();
    };
  }, []);

  return (
    <motion.a
      ref={ref}
      href="abdellah.kachani@e-polytechnique.ma"
      data-cursor="view"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x: magX, y: magY }}
      className="display mt-6 block overflow-hidden text-[clamp(2.6rem,8vw,7.5rem)] leading-none tracking-tight transition-colors hover:text-[var(--accent)]"
    >
      Let&apos;s <span className="text-outline">create</span>
      <br />
      something{" "}
      <em className="serif accent text-[1.05em] italic">together.</em>
    </motion.a>
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

      <div className="hairline-t mt-20 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label-caps text-muted">© 2026 Abdellah Kachani</p>
        <div className="flex flex-wrap gap-6 sm:gap-8">
          {[
            { label: "LinkedIn", href: "https://www.linkedin.com/in/abdellah-kachani-8284a5251/" },
            { label: "Behance", href: "#" },
            { label: "Dribbble", href: "#" },
            { label: "GitHub", href: "https://github.com/kachaniabdellah86" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
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
