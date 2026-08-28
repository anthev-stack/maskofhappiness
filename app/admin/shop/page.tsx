import { prisma } from "@/lib/prisma";
import { ShopManager } from "@/components/admin-shop";

export const dynamic = "force-dynamic";

export default async function AdminShopPage() {
  const products = await prisma.product.findMany({
    include: { variants: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return <ShopManager products={JSON.parse(JSON.stringify(products))} />;
}
