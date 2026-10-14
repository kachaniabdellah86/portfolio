import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n";

const languages = (path: string) =>
  Object.fromEntries(locales.map((lang) => [lang, `${siteUrl}/${lang}${path}`]));

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((lang) => ({
    url: `${siteUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: lang === "fr" ? 1 : 0.9,
    alternates: { languages: languages("") },
  }));
}
