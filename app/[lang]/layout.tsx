import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { contactEmail, siteUrl } from "@/lib/site";
import { hasLocale, locales, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LocaleProvider } from "@/components/LocaleProvider";
import Analytics from "@/components/Analytics";
import "../globals.css";

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

export const dynamicParams = false;

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

function structuredData(lang: Locale) {
  const { meta } = getDictionary(lang);
  const sameAs = [
    "https://www.linkedin.com/in/abdellah-kachani-8284a5251/",
    "https://github.com/kachaniabdellah86",
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Abdellah Kachani",
        jobTitle: lang === "fr" ? "Développeur web freelance" : "Creative developer",
        url: `${siteUrl}/${lang}`,
        email: `mailto:${contactEmail}`,
        address: { "@type": "PostalAddress", addressLocality: "Agadir", addressCountry: "MA" },
        knowsLanguage: ["fr", "en", "ar"],
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "Abdellah Kachani — Web",
        description: meta.description,
        url: `${siteUrl}/${lang}`,
        founder: { "@id": `${siteUrl}/#person` },
        areaServed: [
          { "@type": "City", name: "Agadir" },
          { "@type": "Country", name: "Morocco" },
        ],
        address: { "@type": "PostalAddress", addressLocality: "Agadir", addressCountry: "MA" },
        priceRange: "3500–12000+ MAD",
        availableLanguage: ["fr", "en", "ar"],
        sameAs,
      },
    ],
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} className="cursor-none-fine">
      <body
        className={`${zodiak.variable} ${satoshi.variable} ${instrumentSerif.variable} ${mono.variable} min-h-screen antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData(lang)).replace(/</g, "\\u003c"),
          }}
        />
        <LocaleProvider lang={lang} dict={dict}>
          {children}
        </LocaleProvider>
        <Analytics lang={lang} />
      </body>
    </html>
  );
}
