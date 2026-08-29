"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToCart } from "@/lib/cart";

export function TicketButton({
  eventId,
  slug,
  title,
  imageUrl,
  priceCents,
  ticketCount,
  remaining,
  past,
  requiresAccessCode,
}: {
  eventId: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  priceCents: number;
  ticketCount: number;
  remaining: number | null;
  past: boolean;
  requiresAccessCode: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [accessCode, setAccessCode] = useState("");
  const soldOut = remaining !== null && remaining <= 0;
  const max = remaining === null ? 20 : Math.min(20, remaining);

  function clampQty(value: number) {
    return Math.min(Math.max(value, 1), Math.max(max, 1));
  }

  function payload() {
    return {
      kind: "ticket" as const,
      id: eventId,
      slug,
      title,
      imageUrl,
      priceCents,
      variantName: "Ticket",
      accessCode: requiresAccessCode ? accessCode : undefined,
    };
  }

  function canAdd() {
    return !soldOut && (!requiresAccessCode || accessCode.length === 6);
  }

  function onAdd() {
    if (!canAdd()) return;
    addToCart(payload(), qty, true);
  }

  function onBuy() {
    if (!canAdd()) return;
    addToCart(payload(), qty);
    router.push("/cart");
  }

  if (past) {
    return <p className="text-sm text-[var(--muted)]">This event has already happened.</p>;
  }

  if (soldOut) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">Sold out</p>
        {ticketCount > 0 ? (
          <Link href="/tickets" className="mt-3 inline-block text-sm text-[var(--heading)] underline underline-offset-4">
            View your tickets
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {ticketCount > 0 ? (
        <p className="mb-3 text-sm text-[var(--muted)]">
          You have {ticketCount} ticket{ticketCount === 1 ? "" : "s"}.{" "}
          <Link href="/tickets" className="text-[var(--heading)] underline underline-offset-4">
            View them
          </Link>
        </p>
      ) : null}
      {requiresAccessCode ? (
        <div className="mb-3">
          <label>Access code</label>
          <input
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            placeholder="6 digits"
            className="font-mono tracking-[0.3em]"
          />
        </div>
      ) : null}
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--heading)]">Quantity</p>
      <div className="mb-4 inline-flex items-stretch ring-1 ring-[var(--border)]">
        <button type="button" onClick={() => setQty((value) => clampQty(value - 1))} className="px-4 py-2 text-[var(--heading)]">
          −
        </button>
        <span className="grid min-w-12 place-items-center text-sm text-[var(--heading)]">{qty}</span>
        <button type="button" onClick={() => setQty((value) => clampQty(value + 1))} className="px-4 py-2 text-[var(--heading)]">
          +
        </button>
      </div>
      <button
        type="button"
        disabled={!canAdd()}
        onClick={onAdd}
        className="block w-full py-3 text-sm font-bold uppercase tracking-wide text-[var(--heading)] ring-1 ring-[var(--heading)] disabled:opacity-40"
      >
        Add to cart
      </button>
      <button
        type="button"
        disabled={!canAdd()}
        onClick={onBuy}
        className="mt-2 block w-full bg-[var(--heading)] py-3 text-sm font-bold uppercase tracking-wide text-[var(--bg)] disabled:opacity-40"
      >
        {priceCents > 0 ? "Buy it now" : "Claim now"}
      </button>
    </div>
  );
}
