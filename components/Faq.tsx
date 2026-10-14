"use client";

import { useId, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { whatsappUrl } from "@/lib/site";
import { Reveal } from "./Marquee";
import Rich from "./Rich";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Faq({ t }: { t: Dictionary["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="label-caps accent">{t.label}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.0]">
                <Rich text={t.heading} emClassName="serif accent text-[1.06em] italic" />
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-10 max-w-sm rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(37,211,102,0.12),rgba(255,255,255,0.02)_60%)] p-6">
                <p className="display text-2xl tracking-tight">{t.moreTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{t.moreText}</p>
                <a
                  href={whatsappUrl(t.moreMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="whatsapp_click"
                  data-track-label="faq"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-[#05210f] transition-transform hover:-translate-y-0.5"
                >
                  <WhatsAppIcon />
                  {t.moreCta}
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        <ol className="lg:col-span-8">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;
            return (
              <li key={item.q} className="border-t border-[var(--hairline)] last:border-b">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-baseline gap-5 py-7 text-left sm:gap-8"
                  >
                    <span
                      className={`font-mono text-xs tracking-[0.14em] transition-colors ${
                        isOpen ? "text-[var(--accent)]" : "text-white/60"
                      }`}
                    >
                      Q.{String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`display flex-1 text-[clamp(1.35rem,2.4vw,2rem)] leading-tight tracking-tight transition-colors duration-300 ${
                        isOpen ? "text-[var(--ink)]" : "text-white/80 group-hover:text-[var(--ink)]"
                      }`}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`relative mt-2 size-4 shrink-0 transition-transform duration-500 ${isOpen ? "rotate-[135deg]" : ""}`}
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--accent)]" />
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--accent)]" />
                    </span>
                  </button>
                </h3>
                {/* grid-rows 0fr → 1fr animates to the answer's natural height. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="max-w-2xl pb-8 pl-[3.25rem] text-base leading-relaxed text-white/75 sm:pl-[3.9rem] sm:text-lg">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
