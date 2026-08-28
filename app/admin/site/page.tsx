import { prisma } from "@/lib/prisma";
import { SiteSettings } from "@/components/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminSitePage() {
  const setting = await prisma.setting.findUnique({ where: { id: "site" } });
  return (
    <SiteSettings
      seoTitle={setting?.seoTitle ?? "maskofhappiness"}
      seoDescription={
        setting?.seoDescription ?? "Community events and shared listening from maskofhappiness."
      }
      seoKeywords={setting?.seoKeywords ?? ""}
      ogImageUrl={setting?.ogImageUrl ?? ""}
      faviconUrl={setting?.faviconUrl ?? ""}
      appleIconUrl={setting?.appleIconUrl ?? ""}
      themeColor={setting?.themeColor ?? "#080808"}
      appleAppTitle={setting?.appleAppTitle ?? "maskofhappiness"}
    />
  );
}
