"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { onScroll } from "@/engine";
import { caseStudySlugs } from "@/lib/projects";
import { useLocale } from "../LocaleProvider";

/**
 * Corner navigation: name top-left, sections top-right. White with `difference` blending so it
 * stays legible over limewash, dark cells and screenshots. Phones get one "Menu" button that opens
 * a full-screen list (focus moves in, Escape closes, focus returns).
 */
export default function Header() {
  const { lang, dict } = useLocale();
  const t = dict.home.nav;
  const other = lang === "fr" ? "en" : "fr";
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Step aside while the visitor scrolls down, come back as soon as they scroll up.
  useEffect(() => {
    let last = 0;
    return onScroll(({ y }) => {
      const header = headerRef.current;
      if (!header) return;
      const down = y > last + 2;
      const up = y < last - 2;
      if (down && y > 120) header.classList.add("is-hidden");
      else if (up || y <= 120) header.classList.remove("is-hidden");
      last = y;
    });
  }, []);

  // Section links point at the home page from a case study (the engine lands on the section).
  const pathname = usePathname();
  const base = pathname === `/${lang}` ? "" : `/${lang}`;
  const links = [
    { href: `${base}#work`, label: t.work, count: caseStudySlugs.length },
    { href: `${base}#offers`, label: t.offers },
    { href: `${base}#about`, label: t.about },
    { href: `${base}#contact`, label: t.contact },
  ];

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="g-header" onFocusCapture={() => headerRef.current?.classList.remove("is-hidden")}>
        <a href={`/${lang}`} className="g-header__name g-draw" aria-label={`Abdellah Kachani, ${dict.home.hero.role}`}>
          Kachani
        </a>
        <nav className="g-header__nav" aria-label={dict.nav.label}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="g-draw">
              {link.label}
              {"count" in link && link.count ? <sup>({link.count})</sup> : null}
            </a>
          ))}
          <a href={`/${other}`} hrefLang={other} lang={other} className="g-draw" aria-label={dict.nav.switchLabel}>
            {other.toUpperCase()}
          </a>
        </nav>
        <button
          ref={buttonRef}
          type="button"
          className="g-header__menu g-draw"
          aria-expanded={open}
          aria-controls="g-menu"
          onClick={() => setOpen(true)}
        >
          {t.menu}
        </button>
      </header>

      <nav id="g-menu" className="g-menu" hidden={!open} aria-label={dict.nav.label}>
        <button
          type="button"
          className="g-menu__close g-draw"
          onClick={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
        >
          {t.close}
        </button>
        <ul>
          {links.map((link, i) => (
            <li key={link.href}>
              <a ref={i === 0 ? firstLinkRef : undefined} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={`/${other}`} hrefLang={other} lang={other} className="g-draw" aria-label={dict.nav.switchLabel}>
          {other === "fr" ? "Français" : "English"}
        </a>
      </nav>
    </>
  );
}
