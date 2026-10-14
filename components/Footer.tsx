"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

const noopSubscribe = () => () => {};
const clockTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

// One editable word in the sentence: styled text, with a native <select>
// laid over it so phones get their own picker and keyboards work as usual.
function InlineChoice({
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
    <span className="relative inline-flex items-baseline rounded-md outline-offset-4 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--accent)]">
      <span
        aria-hidden="true"
        className="serif accent italic underline decoration-[var(--accent)]/60 decoration-dashed decoration-1 underline-offset-[0.18em]"
      >
        {options[value]}
      </span>
      <span aria-hidden="true" className="ml-1 font-mono text-[0.45em] text-[var(--accent)]">
        ▼
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
      >
        {options.map((option, i) => (
          <option key={option} value={i}>
            {option}
          </option>
        ))}
      </select>
    </span>
  );
}

/* ── Brief builder: the request is one sentence you edit; WhatsApp opens with it ── */
function BriefBuilder() {
  const t = useLocale().dict.contact.brief;
  const [choice, setChoice] = useState({ type: 0, budget: 1, deadline: 1 });
  // The visitor's clock, read only on the client (empty in the static HTML).
  const time = useSyncExternalStore(noopSubscribe, clockTime, () => "");

  const fields = {
    type: { label: t.typeLabel, options: t.types },
    budget: { label: t.budgetLabel, options: t.budgets },
    deadline: { label: t.deadlineLabel, options: t.deadlines },
  } as const;
  type Field = keyof typeof fields;

  const values = {
    type: t.types[choice.type],
    budget: t.budgets[choice.budget],
    deadline: t.deadlines[choice.deadline],
  };
  const message = `${t.greeting} ${fill(t.sentence, values)}`;

  // "Je veux {type}, avec…" → text, choice, text, choice…
  const parts = t.sentence.split(/(\{\w+\})/).filter(Boolean);

  return (
    <div className="mt-16 grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">{t.title}</p>
        <p className="display mt-6 text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.2] tracking-tight text-white/90">
          {parts.map((part, i) => {
            const key = part.match(/^\{(\w+)\}$/)?.[1] as Field | undefined;
            if (!key || !(key in fields)) return <span key={i}>{part}</span>;
            return (
              <InlineChoice
                key={i}
                label={fields[key].label}
                options={[...fields[key].options]}
                value={choice[key]}
                onChange={(index) => setChoice((current) => ({ ...current, [key]: index }))}
              />
            );
          })}
        </p>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">{t.intro}</p>
      </div>

      <div className="lg:col-span-5">
        <figure
          aria-label={t.previewLabel}
          className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b141a] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        >
          <figcaption className="flex items-center gap-3 bg-[#202c33] px-4 py-3">
            <span className="display flex size-9 items-center justify-center rounded-full bg-[var(--accent-strong)] text-sm text-white">
              AK
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{t.previewName}</span>
              <span className="block truncate text-xs text-white/60">{t.previewStatus}</span>
            </span>
          </figcaption>
          <div className="flex min-h-48 flex-col justify-end bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] p-4 [background-size:14px_14px]">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#005c4b] px-3.5 py-2.5 text-[0.92rem] leading-snug text-[#e9edef]"
            >
              {message}
              <span className="ml-2 inline-flex translate-y-1 items-center gap-1 text-[0.68rem] text-white/60">
                {time}
                <span className="text-[#53bdeb]">✓✓</span>
              </span>
            </motion.p>
          </div>
        </figure>

        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp_click"
          data-track-label="brief"
          className="mt-5 flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-6 py-3 text-sm font-semibold text-[#05210f] shadow-[0_14px_36px_rgba(37,211,102,0.25)] transition-transform hover:-translate-y-0.5"
        >
          <WhatsAppIcon className="size-5" />
          {t.send}
        </a>
      </div>
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
