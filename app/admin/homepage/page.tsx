import { prisma } from "@/lib/prisma";
import { HomepageSettings } from "@/components/homepage-settings";
import { parseIdList } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [setting, products] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "site" } }),
    prisma.product.findMany({
      where: { status: "active" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, imageUrl: true },
    }),
  ]);
  return (
    <HomepageSettings
      logoUrl={setting?.homepageLogoUrl ?? null}
      sourceUrl={setting?.homepageLogoSourceUrl ?? setting?.homepageLogoUrl ?? null}
      accentColor={setting?.accentColor ?? "#e11d48"}
      title={setting?.listenTitle ?? "Listen with us"}
      blurb={
        setting?.listenBlurb ??
        "The brand is built around sharing and listening. These are the playlists we are on right now."
      }
      overlay={setting?.logoOverlay ?? ""}
      overlayUppercase={setting?.logoOverlayUppercase ?? false}
      overlayColor={setting?.logoOverlayColor ?? "#b0bac5"}
      products={products}
      homepageProductIds={parseIdList(setting?.homepageProductIds)}
    />
  );
}
