import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import WorkSection from "@/components/WorkSection";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getProjects } from "@/lib/projects";

// Self-initiated concepts and interaction experiments: craft for the curious,
// kept off the homepage so client work and offers come first there.
export async function generateMetadata({ params }: PageProps<"/[lang]/lab">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).labPage;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/lab`,
      languages: { fr: "/fr/lab", en: "/en/lab", "x-default": "/en/lab" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website", url: `/${lang}/lab`, images: [`/${lang}/opengraph-image`] },
  };
}

export default async function LabPage({ params }: PageProps<"/[lang]/lab">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const concepts = getProjects(lang).filter((project) => !project.slug);
  const otherLang = lang === "fr" ? "en" : "fr";

  return (
    <SmoothScroll>
      <GrainOverlay />

      <main id="main" tabIndex={-1} className="relative min-h-screen bg-[var(--bg)]">
        <header className="flex items-center justify-between px-6 pt-8 sm:px-12">
          <nav aria-label={dict.caseStudy.breadcrumbLabel}>
            <ol className="label-caps flex min-h-10 items-center gap-x-2 text-white/70">
              <li>
                <a href={`/${lang}`} className="transition-colors hover:text-white">
                  <span aria-hidden="true">← </span>
                  {dict.caseStudy.breadcrumbHome}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {dict.labPage.breadcrumb}
              </li>
            </ol>
          </nav>
          <a
            href={`/${otherLang}/lab`}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={dict.nav.switchLabel}
            className="label-caps rounded-full border border-white/20 px-3 py-2 text-white transition-colors hover:border-white/60"
          >
            {otherLang.toUpperCase()}
          </a>
        </header>

        <WorkSection projects={concepts} numeral="01" copy={dict.labPage} asPageTitle />
        <Gallery numeral="02" />
      </main>

      <div className="bg-[var(--bg)]">
        <Footer />
      </div>
    </SmoothScroll>
  );
}
