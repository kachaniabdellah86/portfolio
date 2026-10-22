// The canonical public origin: canonical and hreflang links, Open Graph URLs,
// JSON-LD, the sitemap and robots.txt all build on it.
const productionUrl = "https://www.abdellahkachani.tech";

// NEXT_PUBLIC_SITE_URL can override it (e.g. for a staging domain). An unset or
// blank value falls back to production; a bare host gets https:// added.
function normalizeOrigin(value: string | undefined) {
  const raw = value?.trim();
  if (!raw) return productionUrl;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return productionUrl;
  }
}

export const siteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export const contactEmail = "abdellah.kachani@e-polytechnique.ma";

const whatsappNumber = "212649802019";

export function whatsappUrl(
  message = "Hi Abdellah, I saw your portfolio and I'd like to talk about a project.",
) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
