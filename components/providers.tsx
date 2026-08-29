"use client";

import { SessionProvider } from "next-auth/react";
import { CartToast } from "@/components/cart-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CartToast />
    </SessionProvider>
  );
}
