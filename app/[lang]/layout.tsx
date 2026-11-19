import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Noto_Sans_Tifinagh } from "next/font/google";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/site";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LocaleProvider } from "@/components/LocaleProvider";
import Analytics from "@/components/Analytics";
import Motion from "@/components/agadir/Motion";
import Robot from "@/components/kachani/Robot";
import "../globals.css";
import "../agadir.css";

const zodiak = localFont({
  src: [
    {
      path: "../fonts/Zodiak-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    {
      path: "../fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

// Spec-sheet details: prices, steps, labels. Never above the fold, so no preload.
const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-code",
  display: "swap",
  preload: false,
});

// Agadir system (DESIGN.md): Clash Display for the display voice, General Sans for text,
// Noto Sans Tifinagh only for the word ⴰⴳⴰⴷⵉⵔ.
const clash = localFont({
  src: [
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
});

const general = localFont({
  src: [
    { path: "../fonts/general-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-general",
  display: "swap",
});

const tanker = localFont({
  src: [{ path: "../fonts/tanker-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-tanker",
  display: "swap",
});

const tifinagh = Noto_Sans_Tifinagh({
  subsets: ["tifinagh"],
  weight: "400",
  variable: "--font-tifinagh",
  display: "swap",
  preload: false,
});

// Before first paint: hidden-until-revealed styles only apply when JS runs and motion is allowed.
const flags = `document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')`;

export const dynamicParams = false;

// Re-render once a day so the "Booking — {month}" label follows the calendar.
export const revalidate = 86400;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      locale: lang === "fr" ? "fr_MA" : "en_US",
      url: `/${lang}`,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Font variables live on <html> so tokens declared on :root (agadir.css) can resolve them.
  return (
    <html lang={lang} className={`${zodiak.variable} ${satoshi.variable} ${instrumentSerif.variable} ${mono.variable} ${clash.variable} ${general.variable} ${tanker.variable} ${tifinagh.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: flags }} />
      </head>
      <body
        className="min-h-screen antialiased"
      >
        <a className="skip-link" href="#main">{dict.home.skip}</a>
        {/* Page transitions: an indigo panel wipes up over the page, then lifts off the next one. */}
        <div id="curtain" aria-hidden="true">
          <div className="c-panel">
            <span>Kachani</span>
          </div>
        </div>
        {/* Engine layout contract: the optional cursor-follower host. Empty: the native cursor is the cursor. */}
        <div id="cursor" aria-hidden="true" hidden />
        {/* First visit: the indigo field, the name and a real-progress counter. */}
        <div id="loader" role="status" aria-label={lang === "fr" ? "Chargement" : "Loading"}>
          <div className="l-row">
            <span className="l-count" data-loader-count data-loader-out>000</span>
            <span className="g-tifinagh" lang="zgh" data-loader-out>ⴰⴳⴰⴷⵉⵔ</span>
          </div>
          <div className="l-bar" data-loader-bar />
        </div>
        <LocaleProvider lang={lang} dict={dict}>
          {children}
          {/* The guide lives in the layout, so it rides through page transitions. */}
          <Robot />
        </LocaleProvider>
        <Analytics lang={lang} />
        <Motion />
      </body>
    </html>
  );
}
