// The public origin used for share previews, the sitemap and robots.txt.
// Set NEXT_PUBLIC_SITE_URL once a custom domain is connected.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-self-mu-yyu0uc7xb6.vercel.app"
).replace(/\/$/, "");

export const contactEmail = "abdellah.kachani@e-polytechnique.ma";

const whatsappNumber = "212649802019";

export function whatsappUrl(
  message = "Hi Abdellah, I saw your portfolio and I'd like to talk about a project.",
) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
