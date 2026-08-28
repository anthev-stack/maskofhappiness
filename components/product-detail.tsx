"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { productStock } from "@/lib/shop";
import { addToCart } from "@/lib/cart";

export function ProductDetail({
  product,
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    description: string;
    imageUrl: string | null;
    priceCents: number;
    inventory: number;
    category: string;
    variants: { name: string; inventory: number }[];
  };
}) {
  const router = useRouter();
  const [size, setSize] = useState(product.variants[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const selected = product.variants.find((variant) => variant.name === size);
  const stock = product.variants.length ? selected?.inventory ?? 0 : product.inventory;
  const soldOut = stock <= 0 || productStock(product) <= 0;

  function clampQty(value: number) {
    const max = Math.max(stock, 1);
    return Math.min(Math.max(value, 1), max);
  }

  function cartPayload() {
    return {
      kind: "product" as const,
      id: product.id,
      slug: product.slug,
      title: product.title,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      variantName: size,
    };
  }

  function onAdd() {
    if (soldOut) return;
    addToCart(cartPayload(), qty);
  }

  function onBuy() {
    if (soldOut) return;
    addToCart(cartPayload(), qty);
    router.push("/cart");
  }

  return (
    <div>
      <nav className="mb-8 text-[11px] uppercase tracking-wide text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--heading)]">
          Home
        </Link>
        <span className="px-1.5">/</span>
        {product.category ? (
          <>
            <Link href="/shop" className="hover:text-[var(--heading)]">
              {product.category}
            </Link>
            <span className="px-1.5">/</span>
          </>
        ) : (
          <>
            <Link href="/shop" className="hover:text-[var(--heading)]">
              Shop
            </Link>
            <span className="px-1.5">/</span>
          </>
        )}
        <span className="text-[var(--heading)]">{product.title}</span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover" />
          ) : (
            <div className="grid aspect-square place-items-center text-4xl font-black text-[var(--brand)]">
              {product.title.slice(0, 1)}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide text-[var(--heading)] md:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-xl font-bold text-[var(--heading)]">{formatPrice(product.priceCents)}</p>

          <div className="mt-6 border-t border-[var(--border)] pt-6">
            {product.variants.length > 0 ? (
              <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--heading)]">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.name}
                      type="button"
                      onClick={() => {
                        setSize(variant.name);
                        setQty(1);
                      }}
                      disabled={variant.inventory <= 0}
                      className={`min-w-10 px-3 py-2 text-sm uppercase ${
                        size === variant.name
                          ? "bg-[var(--heading)] font-bold text-[var(--bg)]"
                          : variant.inventory <= 0
                            ? "text-[var(--muted)] line-through opacity-50"
                            : "text-[var(--heading)] ring-1 ring-[var(--border)]"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {soldOut ? (
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">Sold out</p>
            ) : (
              <p className="mb-4 text-xs uppercase tracking-wide text-[var(--muted)]">{stock} in stock</p>
            )}

            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--heading)]">Quantity</p>
            <div className="mb-4 inline-flex items-stretch ring-1 ring-[var(--border)]">
              <button
                type="button"
                disabled={soldOut}
                onClick={() => setQty((value) => clampQty(value - 1))}
                className="px-4 py-2 text-[var(--heading)] disabled:opacity-40"
              >
                −
              </button>
              <span className="grid min-w-12 place-items-center text-sm text-[var(--heading)]">{qty}</span>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => setQty((value) => clampQty(value + 1))}
                className="px-4 py-2 text-[var(--heading)] disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={soldOut}
              onClick={onAdd}
              className="mt-2 block w-full py-3 text-sm font-bold uppercase tracking-wide text-[var(--heading)] ring-1 ring-[var(--heading)] disabled:opacity-40"
            >
              {soldOut ? "Cant add to cart right now" : "Add to cart"}
            </button>
            <button
              type="button"
              disabled={soldOut}
              onClick={onBuy}
              className="mt-2 block w-full bg-[var(--heading)] py-3 text-sm font-bold uppercase tracking-wide text-[var(--bg)] disabled:opacity-40"
            >
              {soldOut ? "Sold out" : "Buy it now"}
            </button>
          </div>

          {product.description ? (
            <p className="mt-8 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{product.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
