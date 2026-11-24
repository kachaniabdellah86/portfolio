"use client";

import Header from "@/components/agadir/Header";
import { useLocale } from "@/components/LocaleProvider";

// A missing page, in the same poster system as the rest of the site: the number set huge on
// the indigo field, one line, and the way home.
export default function NotFound() {
  const { lang, dict } = useLocale();
  const t = dict.home.notFound;
  return (
    <div className="ag">
      <Header />
      <main id="main" tabIndex={-1} className="g-404 g-wrap">
        <div>
          <p className="g-404__num" aria-hidden="true">404</p>
          <h1 className="g-title">{t.title}</h1>
          <p className="g-404__text">{t.text}</p>
          <a href={`/${lang}`} className="g-btn" data-fill>
            <span className="g-btn__fill" aria-hidden="true" />
            {t.back} <span className="g-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </main>
    </div>
  );
}
