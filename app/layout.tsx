import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, DEFAULT_SEO, siteOrigin } from "@/lib/seo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await prisma.setting.findUnique({ where: { id: "site" } });
  const title = setting?.seoTitle || DEFAULT_SEO.title;
  const description = setting?.seoDescription || DEFAULT_SEO.description;
  const origin = siteOrigin();
  const og = absoluteUrl(setting?.ogImageUrl, origin);
  const icon = absoluteUrl(setting?.faviconUrl, origin);
  const apple = absoluteUrl(setting?.appleIconUrl || setting?.faviconUrl, origin);
  const keywords = (setting?.seoKeywords || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: `%s · ${title}`,
    },
    description,
    keywords: keywords.length ? keywords : undefined,
    applicationName: setting?.appleAppTitle || title,
    icons: {
      icon: icon || "/favicon.ico",
      apple: apple || undefined,
    },
    openGraph: {
      type: "website",
      locale: "en_AU",
      url: origin,
      siteName: title,
      title,
      description,
      images: og ? [{ url: og, alt: title }] : undefined,
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      title,
      description,
      images: og ? [og] : undefined,
    },
    appleWebApp: {
      capable: true,
      title: setting?.appleAppTitle || title,
      statusBarStyle: "black-translucent",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const setting = await prisma.setting.findUnique({ where: { id: "site" } });
  return {
    themeColor: setting?.themeColor || DEFAULT_SEO.themeColor,
    colorScheme: "dark",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const setting = await prisma.setting.findUnique({ where: { id: "site" } });
  const accent = setting?.accentColor || "#e11d48";

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      style={{ "--brand": accent } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="py-8 text-center text-sm">
            <a
              href="https://www.instagram.com/amaskofhappiness"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--muted)] hover:text-[var(--brand)]"
            >
              @amaskofhappiness
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
