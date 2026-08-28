import Link from "next/link";
import { ShopProductCard, type ShopCardProduct } from "@/components/shop-product-card";

export function ShopGrid({ products }: { products: ShopCardProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section id="shop">
      <h2 className="mb-4 text-xl font-bold text-[var(--heading)]">Shop maskofhappiness</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5">
        {products.map((product) => (
          <ShopProductCard key={product.slug} product={product} />
        ))}
      </div>
      <Link href="/shop" className="mt-4 inline-block text-sm text-[var(--muted)] hover:text-[var(--heading)]">
        View all
      </Link>
    </section>
  );
}
