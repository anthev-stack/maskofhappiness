"use client";

import { useEffect, useState } from "react";

export function CartToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hide: number;
    function onAdd() {
      window.clearTimeout(hide);
      setShow(true);
      hide = window.setTimeout(() => setShow(false), 1800);
    }
    window.addEventListener("moh-cart-added", onAdd);
    return () => {
      window.removeEventListener("moh-cart-added", onAdd);
      window.clearTimeout(hide);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--heading)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--bg)] shadow-lg"
    >
      Added to cart!
    </div>
  );
}
