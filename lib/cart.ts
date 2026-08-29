const KEY = "moh-cart";

export type CartKind = "product" | "ticket";

export type CartItem = {
  kind: CartKind;
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  priceCents: number;
  variantName: string;
  quantity: number;
  accessCode?: string;
};

function normalize(row: Record<string, unknown>): CartItem | null {
  const quantity = Math.max(1, Number(row.quantity) || 1);
  if (row.kind === "ticket" || (!row.kind && row.eventId)) {
    const id = String(row.id ?? row.eventId ?? "");
    if (!id) return null;
    return {
      kind: "ticket",
      id,
      slug: String(row.slug ?? ""),
      title: String(row.title ?? ""),
      imageUrl: (row.imageUrl as string | null) ?? null,
      priceCents: Number(row.priceCents) || 0,
      variantName: "Ticket",
      quantity,
      accessCode: row.accessCode ? String(row.accessCode) : undefined,
    };
  }
  const id = String(row.id ?? row.productId ?? "");
  if (!id) return null;
  return {
    kind: "product",
    id,
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    imageUrl: (row.imageUrl as string | null) ?? null,
    priceCents: Number(row.priceCents) || 0,
    variantName: String(row.variantName ?? ""),
    quantity,
  };
}

export function sameLine(a: CartItem, b: Pick<CartItem, "kind" | "id" | "variantName">) {
  if (a.kind !== b.kind || a.id !== b.id) return false;
  if (a.kind === "ticket") return true;
  return a.variantName === b.variantName;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalize(row)).filter((row): row is CartItem => Boolean(row));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("moh-cart"));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number, at?: { x: number; y: number }) {
  const items = readCart();
  const index = items.findIndex((row) => sameLine(row, item));
  if (index >= 0) {
    items[index].quantity += quantity;
    if (item.kind === "ticket" && item.accessCode) {
      items[index].accessCode = item.accessCode;
    }
  } else {
    items.push({ ...item, quantity });
  }
  writeCart(items);
  if (at) window.dispatchEvent(new CustomEvent("moh-cart-added", { detail: at }));
}

export function setCartQty(item: Pick<CartItem, "kind" | "id" | "variantName">, quantity: number) {
  const items = readCart();
  writeCart(
    items
      .map((row) => (sameLine(row, item) ? { ...row, quantity } : row))
      .filter((row) => row.quantity > 0)
  );
}

export function removeCartLine(item: Pick<CartItem, "kind" | "id" | "variantName">) {
  writeCart(readCart().filter((row) => !sameLine(row, item)));
}
