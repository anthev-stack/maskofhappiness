import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "maskofhappiness",
  description: "Community events and shared listening from maskofhappiness.",
};

export const dynamic = "force-dynamic";

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
