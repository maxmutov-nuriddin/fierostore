/**
 * Central SEO + brand configuration.
 *
 * Update NEXT_PUBLIC_SITE_URL in .env.local / your hosting env to your real
 * production domain so canonical URLs, sitemap, OG tags and JSON-LD all resolve
 * to absolute, indexable links.
 */

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const siteConfig = {
  /** Short brand mark shown in titles / icons. */
  name: "FIERO",
  /** Full brand name. */
  fullName: "FIERO — Women's Wear",
  /** Default, brand-forward homepage title. */
  defaultTitle: "FIERO — Women's Wear | Premium Modern Fashion Boutique",
  /** Title template applied to inner pages. */
  titleTemplate: "%s | FIERO Women's Wear",
  description:
    "FIERO is a premium women's wear boutique — quiet-luxury silhouettes, clean essentials, and new-season drops. Shop curated dresses, tops, and layers with fast, friction-light checkout.",
  /** Keywords (used sparingly; modern SEO mostly ignores them but harmless). */
  keywords: [
    "FIERO",
    "women's wear",
    "women's fashion",
    "premium fashion boutique",
    "quiet luxury",
    "minimal clothing",
    "dresses",
    "online boutique",
    "ayollar kiyimlari",
    "женская одежда"
  ],
  locale: "en_US",
  /** Public-facing social handle (without @). */
  instagram: "fierostore",
  get instagramUrl() {
    return `https://instagram.com/${this.instagram}`;
  },
  get url() {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  }
} as const;

export function absoluteUrl(path = "") {
  if (!path) return siteConfig.url;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
