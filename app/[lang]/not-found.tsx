"use client";

import Header from "@/components/agadir/Header";
import { useLocale } from "@/components/LocaleProvider";

// The 404 carries the concept: a cell that was never built, only its outline in the wall.
export default function NotFound() {
  const { lang, dict } = useLocale();
  const t = dict.home.notFound;
  return (
    <div className="ag">
      <Header />
      <main id="main" tabIndex={-1} className="g-404">
        <div>
          <div className="g-404__cell" aria-hidden="true">
            <span lang="zgh">ⴰⴳⴰⴷⵉⵔ</span>
          </div>
          <p className="g-meta num">404</p>
          <h1 className="g-title" style={{ maxWidth: "14ch", marginTop: "0.5rem" }}>{t.title}</h1>
          <p style={{ maxWidth: "44ch", marginTop: "1.2rem", color: "var(--c-muted)" }}>{t.text}</p>
          <a href={`/${lang}`} className="g-btn" data-fill style={{ marginTop: "2rem" }}>
            <span className="g-btn__fill" aria-hidden="true" />
            {t.back} <span className="g-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </main>
    </div>
  );
}
