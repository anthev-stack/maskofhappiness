export type ShopVariant = { id?: string; name: string; inventory: number };

export function parseIdList(value?: string | null) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function productStock(product: { inventory: number; variants?: { inventory: number }[] }) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, variant) => sum + variant.inventory, 0);
  }
  return product.inventory;
}

export function normalizeVariants(input: unknown): ShopVariant[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((row, index) => ({
      name: String(row?.name ?? "").trim(),
      inventory: Math.max(0, Number(row?.inventory ?? 0) || 0),
      sortOrder: index,
    }))
    .filter((row) => row.name);
}
