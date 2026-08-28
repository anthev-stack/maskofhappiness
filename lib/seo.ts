export const DEFAULT_SEO = {
  title: "maskofhappiness",
  description: "Community events and shared listening from maskofhappiness.",
  themeColor: "#080808",
};

export function siteOrigin() {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string | null | undefined, origin = siteOrigin()) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export type SeoSetting = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  appleIconUrl: string | null;
  themeColor: string;
  appleAppTitle: string;
};
