import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./agadir.css";

// Unknown top-level URLs bypass the [lang] layout entirely, so this page carries its own fonts
// and styles. Same concept as app/[lang]/not-found.tsx: a cell that was never built.
const clash = localFont({ src: "./fonts/ClashDisplay-600.woff2", weight: "600", variable: "--font-clash", display: "swap" });
const general = localFont({ src: "./fonts/general-sans-400-normal.woff2", weight: "400", variable: "--font-general", display: "swap" });

export const metadata: Metadata = {
  title: "404: this cell was never built | Abdellah Kachani",
  description: "The page you are looking for is not in the wall.",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${clash.variable} ${general.variable}`}>
      <body className="ag">
        <div id="cursor" aria-hidden="true" hidden />
        <main id="main" className="g-404">
          <div>
            <div className="g-404__cell" aria-hidden="true">
              <span lang="zgh">ⴰⴳⴰⴷⵉⵔ</span>
            </div>
            <p className="g-meta num">404</p>
            <h1 className="g-title" style={{ maxWidth: "14ch", marginTop: "0.5rem" }}>This cell was never built</h1>
            <p style={{ maxWidth: "44ch", marginTop: "1.2rem", color: "var(--c-muted)" }}>
              The page you&apos;re looking for isn&apos;t in the wall.{" "}
              <span lang="fr">Cette page n&apos;est pas dans le mur.</span>
            </p>
            <p style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "2rem" }}>
              <Link href="/en" className="g-btn">
                Back to the wall <span aria-hidden="true">→</span>
              </Link>
              <Link href="/fr" className="g-btn g-btn--ghost" lang="fr">
                Retour au mur
              </Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
