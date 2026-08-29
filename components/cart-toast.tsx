"use client";

import { useEffect, useState } from "react";

export function CartToast() {
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let hide: number;
    function onAdd(event: Event) {
      const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
      if (!detail) return;
      window.clearTimeout(hide);
      setSpot(detail);
      hide = window.setTimeout(() => setSpot(null), 1600);
    }
    window.addEventListener("moh-cart-added", onAdd);
    return () => {
      window.removeEventListener("moh-cart-added", onAdd);
      window.clearTimeout(hide);
    };
  }, []);

  if (!spot) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full bg-[var(--heading)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--bg)] shadow-lg"
      style={{ left: spot.x, top: spot.y - 10 }}
    >
      Added to cart!
    </div>
  );
}
