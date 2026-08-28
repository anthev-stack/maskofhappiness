"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { cartCount, readCart, removeCartLine, setCartQty, writeCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function sync() {
      setItems(readCart());
    }
    sync();
    window.addEventListener("moh-cart", sync);
    return () => window.removeEventListener("moh-cart", sync);
  }, []);

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const hasTickets = items.some((item) => item.kind === "ticket");
  const hasProducts = items.some((item) => item.kind === "product");

  async function checkout() {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not check out.");
      return;
    }
    if (data.ticketsIssued) {
      writeCart(readCart().filter((item) => item.kind !== "ticket"));
    }
    if (data.merchPending) {
      setNotice("Tickets are on your account. Merch checkout is not live yet, so shop items stayed in the cart.");
    } else {
      router.push("/tickets");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold uppercase text-[var(--heading)]">Cart</h1>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Your cart is empty.{" "}
          <Link href="/shop" className="text-[var(--heading)] underline underline-offset-4">
            Continue shopping
          </Link>
          {" · "}
          <Link href="/" className="text-[var(--heading)] underline underline-offset-4">
            Browse events
          </Link>
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={`${item.kind}-${item.id}-${item.variantName}`} className="flex gap-4">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-20 w-20 object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center text-lg font-black text-[var(--brand)]">
                  {item.title.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={item.kind === "ticket" ? `/events/${item.slug}` : `/shop/${item.slug}`}
                  className="font-bold uppercase text-[var(--heading)]"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-xs uppercase text-[var(--muted)]">
                  {item.kind === "ticket" ? "Ticket" : item.variantName || "Merch"}
                </p>
                <div className="mt-2 inline-flex items-stretch ring-1 ring-[var(--border)]">
                  <button
                    type="button"
                    className="px-3 py-1 text-[var(--heading)]"
                    onClick={() => setCartQty(item, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="grid min-w-8 place-items-center text-sm text-[var(--heading)]">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-3 py-1 text-[var(--heading)]"
                    onClick={() => setCartQty(item, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--heading)]">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs uppercase text-[var(--muted)] hover:text-[var(--heading)]"
                  onClick={() => removeCartLine(item)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-right text-lg font-bold text-[var(--heading)]">Total {formatPrice(total)}</p>
            <p className="mt-1 text-right text-xs uppercase text-[var(--muted)]">{cartCount(items)} items</p>
            {hasProducts && !hasTickets ? (
              <p className="mt-3 text-sm text-[var(--muted)]">Merch checkout is not live yet. Tickets can be checked out now.</p>
            ) : null}
            {hasTickets ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void checkout()}
                className="mt-4 w-full bg-[var(--heading)] py-3 text-sm font-bold uppercase tracking-wide text-[var(--bg)] disabled:opacity-40"
              >
                {busy ? "Working…" : status === "authenticated" ? "Checkout" : "Sign in to checkout"}
              </button>
            ) : null}
            {error ? <p className="mt-3 text-sm text-[#ff6984]">{error}</p> : null}
            {notice ? <p className="mt-3 text-sm text-[var(--muted)]">{notice}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
