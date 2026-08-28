import { prisma } from "@/lib/prisma";
import { ShopCatalog } from "@/components/shop-catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mb-2 text-3xl font-extrabold uppercase text-[var(--heading)]">Shop</h1>
      {products.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface-2)] p-6 text-sm ring-1 ring-[var(--border)]">
          Nothing in the shop yet.
        </p>
      ) : (
        <ShopCatalog products={JSON.parse(JSON.stringify(products))} />
      )}
    </div>
  );
}
