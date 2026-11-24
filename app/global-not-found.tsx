import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./agadir.css";

// Unknown top-level URLs bypass the [lang] layout entirely, so this page carries its own fonts
// and styles. Same poster as app/[lang]/not-found.tsx, in both languages.
const tanker = localFont({ src: "./fonts/tanker-400-normal.woff2", weight: "400", variable: "--font-tanker", display: "swap" });
const general = localFont({
  src: [
    { path: "./fonts/general-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-general",
  display: "swap",
});

export const metadata: Metadata = {
  title: "404: nothing here | Abdellah Kachani",
  description: "This page doesn't exist.",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${tanker.variable} ${general.variable}`}>
      <body className="ag">
        <a className="skip-link" href="#main">Skip to content</a>
        <div id="cursor" aria-hidden="true" hidden />
        <main id="main" tabIndex={-1} className="g-404 g-wrap">
          <div>
            <p className="g-404__num" aria-hidden="true">404</p>
            <h1 className="g-title">Nothing here</h1>
            <p className="g-404__text">
              This page doesn&apos;t exist. <span lang="fr">Cette page n&apos;existe pas.</span>
            </p>
            <p className="g-404__actions">
              <Link href="/en" className="g-btn">
                Home <span aria-hidden="true">→</span>
              </Link>
              <Link href="/fr" className="g-btn g-btn--ghost" lang="fr">
                Accueil
              </Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
