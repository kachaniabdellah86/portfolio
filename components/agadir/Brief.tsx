"use client";

import { useState } from "react";
import { fill } from "@/lib/i18n";
import { contactEmail, whatsappUrl } from "@/lib/site";
import { useLocale } from "../LocaleProvider";
import WhatsAppIcon from "../WhatsAppIcon";

/** The brief as one sentence: the visitor picks three words, WhatsApp opens with it written. */
export default function Brief() {
  const { dict } = useLocale();
  const b = dict.contact.brief;
  const t = dict.home.finale;
  const [type, setType] = useState(b.types[0]);
  const [budget, setBudget] = useState(b.budgets[1]);
  const [deadline, setDeadline] = useState(b.deadlines[1]);
  const [copied, setCopied] = useState(false);
  const message = `${b.greeting} ${fill(b.sentence, { type, budget, deadline })}`;

  const select = (label: string, value: string, options: string[], set: (v: string) => void) => (
    <select aria-label={label} value={value} onChange={(e) => set(e.target.value)}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );

  const [before, rest] = b.sentence.split("{type}");
  const [middle, rest2] = rest.split("{budget}");
  const [middle2, after] = rest2.split("{deadline}");

  return (
    <>
      <div className="g-finale__actions">
        <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="g-btn" data-fill data-track="whatsapp_click" data-track-label="finale">
          <span className="g-btn__fill" aria-hidden="true" />
          <WhatsAppIcon />
          {t.whatsapp}
        </a>
        <a href={`mailto:${contactEmail}`} className="g-btn g-btn--ghost" data-fill>
          <span className="g-btn__fill" aria-hidden="true" />
          {t.email}
        </a>
        <button
          type="button"
          className="g-link"
          style={{ fontSize: "var(--t-s)" }}
          onClick={() => {
            navigator.clipboard?.writeText(contactEmail).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            });
          }}
        >
          {copied ? t.copied : `${t.copy} ${contactEmail}`}
        </button>
      </div>

      <form className="g-brief" data-robot-react={dict.robot.hoverBrief} onSubmit={(e) => { e.preventDefault(); window.open(whatsappUrl(message), "_blank", "noopener"); }}>
        <p className="g-brief__label">{t.brief}</p>
        <p className="g-brief__sentence">
          {b.greeting} {before}
          {select(b.typeLabel, type, b.types, setType)}
          {middle}
          {select(b.budgetLabel, budget, b.budgets, setBudget)}
          {middle2}
          {select(b.deadlineLabel, deadline, b.deadlines, setDeadline)}
          {after}
        </p>
        <button type="submit" className="g-btn" data-fill style={{ marginTop: "1.6rem" }}>
          <span className="g-btn__fill" aria-hidden="true" />
          {t.send} <span className="g-arrow" aria-hidden="true">→</span>
        </button>
      </form>
    </>
  );
}
