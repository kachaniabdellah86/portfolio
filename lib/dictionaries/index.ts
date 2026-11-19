import { fill, type Locale } from "@/lib/i18n";
import { en, type Dictionary } from "./en";
import { fr } from "./fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

// The month a new project can start: this month until the 20th, then the next one.
// Pages revalidate daily (see app/[lang]/layout.tsx), so the label never goes stale.
export function bookingMonth(lang: Locale, now = new Date()) {
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
  const start = new Date(local.getFullYear(), local.getMonth() + (local.getDate() > 20 ? 1 : 0), 1);
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    year: "numeric",
  }).format(start);
}

export function getDictionary(lang: Locale): Dictionary {
  const dict = dictionaries[lang];
  return {
    ...dict,
    nav: { ...dict.nav, available: fill(dict.nav.available, { month: bookingMonth(lang) }) },
  };
}

export type { Dictionary };
