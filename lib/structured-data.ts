import type { Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";
import { getDictionary } from "@/lib/dictionaries";
import { contactEmail, siteUrl } from "@/lib/site";

// One entity graph, shared across pages through stable @ids: the home pages
// describe the person, the website and the service; case studies describe
// the work and point back to the person.

const ids = {
  person: `${siteUrl}/#person`,
  website: `${siteUrl}/#website`,
  service: `${siteUrl}/#service`,
};

const sameAs = [
  "https://www.linkedin.com/in/abdellah-kachani-8284a5251/",
  "https://github.com/kachaniabdellah86",
];

const address = { "@type": "PostalAddress", addressLocality: "Agadir", addressCountry: "MA" };

function person(lang: Locale) {
  return {
    "@type": "Person",
    "@id": ids.person,
    name: "Abdellah Kachani",
    jobTitle: lang === "fr" ? "Développeur web créatif & full-stack" : "Creative & full-stack developer",
    description: getDictionary(lang).meta.description,
    url: `${siteUrl}/${lang}`,
    image: `${siteUrl}/media/abdellah-kachani.jpg`,
    email: `mailto:${contactEmail}`,
    address,
    // Current studies (schema.org's alumniOf covers current students too).
    alumniOf: { "@type": "CollegeOrUniversity", name: "Polytechnique Agadir" },
    knowsLanguage: ["fr", "en", "ar"],
    knowsAbout: [
      "Web development",
      "Next.js",
      "React",
      "TypeScript",
      "Three.js",
      "WebGL",
      "UI/UX design",
      "Full-stack development",
    ],
    sameAs,
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: `${siteUrl}/`,
    name: "Abdellah Kachani",
    alternateName: ["abdellahkachani.tech", "Abdellah Kachani — Portfolio"],
    inLanguage: ["fr", "en"],
    publisher: { "@id": ids.person },
  };
}

function service(lang: Locale) {
  return {
    "@type": "ProfessionalService",
    "@id": ids.service,
    name: lang === "fr" ? "Abdellah Kachani — Création de sites web" : "Abdellah Kachani — Web development",
    description: getDictionary(lang).meta.description,
    url: `${siteUrl}/${lang}`,
    image: `${siteUrl}/media/abdellah-kachani.jpg`,
    founder: { "@id": ids.person },
    areaServed: [
      { "@type": "City", name: "Agadir" },
      { "@type": "Country", name: "Morocco" },
    ],
    address,
    priceRange: "1900–7500+ MAD",
    availableLanguage: ["fr", "en", "ar"],
    sameAs,
  };
}

export function homeGraph(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [website(), person(lang), service(lang)],
  };
}

export function caseStudyGraph(lang: Locale, project: Project) {
  const t = getDictionary(lang).caseStudy;
  const url = `${siteUrl}/${lang}/work/${project.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: project.title,
        headline: `${project.title} — ${t.eyebrow}`,
        description: project.seoDescription,
        url,
        inLanguage: lang,
        dateCreated: project.year,
        image: project.preview ? `${siteUrl}${project.preview.src}` : undefined,
        author: { "@id": ids.person },
        creator: { "@id": ids.person },
        isPartOf: { "@id": ids.website },
        keywords: project.details.stack.join(", "),
        sameAs: project.href,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: `${siteUrl}/${lang}` },
          { "@type": "ListItem", position: 2, name: project.title, item: url },
        ],
      },
    ],
  };
}

// Serialised for a <script type="application/ld+json">, safe against "</script>".
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
