"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "motion/react";
import { contactEmail, whatsappUrl } from "@/lib/site";
import { fill } from "@/lib/i18n";
import { Reveal } from "./Marquee";
import { useLocale } from "./LocaleProvider";
import Rich from "./Rich";
import WhatsAppIcon from "./WhatsAppIcon";

/* ── Split-hover effect using the already-installed split-type package ── */
function SplitHoverLink() {
  const t = useLocale().dict.contact;
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
      href={`mailto:${contactEmail}`}
      aria-label={t.emailAria}
      data-cursor="view"
      data-track="email_click"
      data-track-label="footer-heading"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x: magX, y: magY }}
      className="display mt-6 block overflow-hidden text-[clamp(2.6rem,8vw,7.5rem)] leading-none tracking-tight transition-colors hover:text-[var(--accent)]"
    >
      <Rich text={t.heading} emClassName="serif accent text-[1.05em] italic" />
    </motion.a>
  );
}

function CopyEmailButton() {
  const t = useLocale().dict.contact;
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
      await navigator.clipboard.writeText(contactEmail);
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
      data-track="email_copy"
      className="group inline-flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-md transition-all hover:border-[var(--accent)]/60 hover:bg-white/10 cursor-pointer"
    >
      <span className="truncate font-mono text-xs text-white/80 transition-colors group-hover:text-white">
        {contactEmail}
      </span>
      <span
        aria-live="polite"
        className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider transition-all ${
          copyState === "copied"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            : copyState === "error"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            : "bg-white/10 text-white/70 group-hover:text-white"
        }`}
      >
        {copyState === "copied" ? t.copied : copyState === "error" ? t.retry : t.copy}
      </span>
    </button>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: number;
  onChange: (index: number) => void;
}) {
  return (
    <fieldset>
      <legend className="label-caps mb-3 text-white/60">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={`min-h-10 rounded-full border px-4 py-2 text-sm transition-colors ${
              value === i
                ? "border-[var(--accent)] bg-[var(--accent-strong)] text-white"
                : "border-white/15 bg-white/[0.03] text-white/75 hover:border-white/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* ── Brief builder: three taps, then WhatsApp opens with the brief written ── */
function BriefBuilder() {
  const t = useLocale().dict.contact.brief;
  const [type, setType] = useState(0);
  const [budget, setBudget] = useState(1);
  const [deadline, setDeadline] = useState(1);

  const message = fill(t.message, {
    type: t.types[type],
    budget: t.budgets[budget],
    deadline: t.deadlines[deadline],
  });

  return (
    <div className="mt-14 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <h3 className="display text-2xl tracking-tight sm:text-3xl">{t.title}</h3>
      <p className="mt-2 text-sm text-white/65">{t.intro}</p>
      <div className="mt-8 grid gap-7">
        <ChoiceRow label={t.typeLabel} options={t.types} value={type} onChange={setType} />
        <ChoiceRow label={t.budgetLabel} options={t.budgets} value={budget} onChange={setBudget} />
        <ChoiceRow label={t.deadlineLabel} options={t.deadlines} value={deadline} onChange={setDeadline} />
      </div>
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        data-track="whatsapp_click"
        data-track-label="brief"
        className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(91,143,255,0.3)] transition-transform hover:-translate-y-0.5"
      >
        <WhatsAppIcon />
        {t.send}
      </a>
    </div>
  );
}

export default function Footer() {
  const { dict } = useLocale();
  const t = dict.contact;

  return (
    <footer id="contact" className="hairline-t px-6 pb-12 pt-24 sm:px-12 sm:pt-36">
      <Reveal>
        <p className="label-caps accent">{t.label}</p>
      </Reveal>

      <Reveal delay={0.08}>
        <SplitHoverLink />
      </Reveal>

      <Reveal delay={0.16}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={whatsappUrl(dict.journey.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp_click"
            data-track-label="footer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(91,143,255,0.3)] transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon />
            {t.whatsapp}
          </a>
          <CopyEmailButton />
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <BriefBuilder />
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
