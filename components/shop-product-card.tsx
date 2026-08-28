import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { productStock } from "@/lib/shop";

export type ShopCardProduct = {
  slug: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  priceCents: number;
  inventory: number;
  category?: string;
  variants?: { inventory: number }[];
};

export function ShopProductCard({ product }: { product: ShopCardProduct }) {
  const stock = productStock(product);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover" />
        ) : (
          <div className="grid aspect-square place-items-center text-2xl font-black text-[var(--brand)]">
            {product.title.slice(0, 1)}
          </div>
        )}
        <span
          className={`absolute left-0 top-0 text-[10px] font-semibold uppercase tracking-wide ${
            stock <= 0 ? "bg-[var(--brand)] px-1.5 py-0.5 text-white" : "text-[var(--heading)]"
          }`}
        >
          {stock <= 0 ? "Sold out" : `${stock} in stock`}
        </span>
      </div>
      {product.category ? (
        <p className="mt-3 text-[11px] uppercase tracking-wide text-[var(--muted)]">{product.category}</p>
      ) : null}
      <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[var(--heading)] group-hover:text-[var(--brand)]">
        {product.title}
      </p>
      {product.description ? (
        <p className="mt-1 line-clamp-2 text-[11px] uppercase leading-4 tracking-wide text-[var(--muted)]">
          {product.description}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-semibold text-[var(--heading)]">{formatPrice(product.priceCents)}</p>
    </Link>
  );
}
