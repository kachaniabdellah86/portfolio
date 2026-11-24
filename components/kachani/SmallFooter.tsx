import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

// The last line of every page: copyright, the secondary pages and the other language.
export default function SmallFooter({ lang, children }: { lang: Locale; children?: React.ReactNode }) {
  const t = getDictionary(lang).home;
  const other = lang === "fr" ? "en" : "fr";
  return (
    <div className="g-small">
      {children}
      <p>
        © {new Date().getFullYear()} {t.finale.small}
      </p>
      <nav aria-label="Footer">
        <a href={`/${lang}/lab`}>{t.hero.labTitle}</a>
        <a href={`/${lang}/studios`}>{lang === "fr" ? "Agences" : "Studios"}</a>
        <a href="https://www.linkedin.com/in/abdellah-kachani-8284a5251" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/kachaniabdellah86" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={`/${other}`} hrefLang={other}>{lang === "fr" ? "English" : "Français"}</a>
      </nav>
    </div>
  );
}
