"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartCount, readCart } from "@/lib/cart";

export function CartNavLink({ className, onClick }: { className: string; onClick?: () => void }) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      setCount(cartCount(readCart()));
      setReady(true);
    }
    sync();
    window.addEventListener("moh-cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("moh-cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link className={className} href="/cart" onClick={onClick}>
      Cart{ready && count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
