import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n";
import { caseStudySlugs } from "@/lib/projects";

const paths = ["", ...caseStudySlugs.map((slug) => `/work/${slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteUrl}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? (lang === "fr" ? 1 : 0.9) : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
      },
    })),
  );
}
