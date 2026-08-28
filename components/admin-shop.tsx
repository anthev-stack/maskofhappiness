"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { productStock } from "@/lib/shop";
import { formatPrice } from "@/lib/utils";

type VariantRow = { name: string; inventory: number };

type ProductItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  inventory: number;
  category: string;
  productType: string;
  status: string;
  variants?: VariantRow[];
};

async function uploadImage(file: File | null) {
  if (!file || file.size === 0) return null;
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not upload image.");
  return data.url as string;
}

export function ShopManager({ products }: { products: ProductItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [editing, setEditing] = useState<ProductItem | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.productType.toLowerCase().includes(q)
    );
  }, [items, query]);

  const activeCount = items.filter((item) => item.status === "active").length;
  const outOfStock = items.filter((item) => productStock(item) <= 0).length;
  const current = editing && editing !== "new" ? editing : null;

  function startEdit(item: ProductItem | "new") {
    setEditing(item);
    setVariants(item === "new" ? [] : item.variants?.length ? item.variants.map((row) => ({ ...row })) : []);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setBusy(true);
    try {
      const data = new FormData(form);
      const imageUrl = (await uploadImage(data.get("image") as File | null)) ?? current?.imageUrl ?? null;
      const payload = {
        id: current?.id,
        title: data.get("title"),
        description: data.get("description"),
        priceCents: Math.round(Number(data.get("price") || 0) * 100),
        inventory: Number(data.get("inventory") || 0),
        category: data.get("category"),
        productType: data.get("productType"),
        status: data.get("status"),
        imageUrl,
        variants,
      };
      const res = await fetch("/api/admin/products", {
        method: current ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not save product.");
        return;
      }
      const saved = json.product as ProductItem;
      setItems((list) =>
        current ? list.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...list]
      );
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((list) => list.filter((item) => item.id !== id));
    if (current?.id === id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-[var(--heading)]">Products</h2>
        <button
          type="button"
          onClick={() => startEdit("new")}
          className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-[#032012]"
        >
          Add product
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Active products" value={activeCount} />
        <Stat label="Out of stock" value={outOfStock} />
        <Stat label="All products" value={items.length} />
      </div>

      {editing ? (
        <form
          key={current?.id ?? "new"}
          onSubmit={save}
          className="space-y-3 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]"
        >
          <h3 className="text-lg font-bold text-[var(--heading)]">{current ? "Edit product" : "New product"}</h3>
          <div>
            <label>Title</label>
            <input name="title" required defaultValue={current?.title ?? ""} />
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" rows={3} defaultValue={current?.description ?? ""} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label>Price (AUD)</label>
              <input name="price" type="number" min="0" step="0.01" defaultValue={current ? (current.priceCents / 100).toFixed(2) : "0"} />
            </div>
            {variants.length === 0 ? (
              <div>
                <label>Inventory</label>
                <input name="inventory" type="number" min="0" defaultValue={current?.inventory ?? 0} />
              </div>
            ) : (
              <div>
                <label>Inventory</label>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {variants.reduce((sum, row) => sum + (Number(row.inventory) || 0), 0)} in stock across variants
                </p>
              </div>
            )}
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="mb-0">Variants</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setVariants((rows) =>
                      rows.length ? rows : ["S", "M", "L", "XL"].map((name) => ({ name, inventory: 0 }))
                    )
                  }
                  className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-xs text-[var(--heading)]"
                >
                  Add S–XL
                </button>
                <button
                  type="button"
                  onClick={() => setVariants((rows) => [...rows, { name: "", inventory: 0 }])}
                  className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-xs text-[var(--heading)]"
                >
                  Add variant
                </button>
              </div>
            </div>
            {variants.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Optional. Add sizes like S, M, L with their own stock.</p>
            ) : (
              <div className="space-y-2">
                {variants.map((row, index) => (
                  <div key={index} className="grid grid-cols-[1fr_100px_auto] gap-2">
                    <input
                      value={row.name}
                      onChange={(event) =>
                        setVariants((rows) =>
                          rows.map((item, i) => (i === index ? { ...item, name: event.target.value } : item))
                        )
                      }
                      placeholder="Size"
                    />
                    <input
                      type="number"
                      min="0"
                      value={row.inventory}
                      onChange={(event) =>
                        setVariants((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, inventory: Number(event.target.value) || 0 } : item
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setVariants((rows) => rows.filter((_, i) => i !== index))}
                      className="rounded-xl bg-[var(--surface-4)] px-3 text-sm text-[#ff6984]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label>Category</label>
              <input name="category" defaultValue={current?.category ?? ""} placeholder="Shirts" />
            </div>
            <div>
              <label>Product type</label>
              <input name="productType" defaultValue={current?.productType ?? ""} placeholder="Merchandise" />
            </div>
          </div>
          <div>
            <label>Status</label>
            <select name="status" defaultValue={current?.status ?? "active"}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label>Photo</label>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
            {current?.imageUrl ? (
              <p className="mt-1 text-xs text-[var(--muted)]">Leave empty to keep the current photo.</p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 font-bold text-[#032012] disabled:opacity-60">
              {busy ? "Saving…" : current ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-xl bg-[var(--surface-4)] px-4 py-2.5 text-sm text-[var(--heading)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-[var(--surface-2)] ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
          <span className="text-sm text-[var(--heading)]">All</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search and filter"
            className="max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--heading)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Inventory</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Product type</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface-4)] text-xs font-bold text-[var(--brand)]">
                          {item.title.slice(0, 1)}
                        </div>
                      )}
                      <span className="font-semibold text-[var(--heading)]">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        item.status === "active"
                          ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                          : "bg-[var(--surface-4)] text-[var(--muted)]"
                      }`}
                    >
                      {item.status === "active" ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${productStock(item) <= 0 ? "text-[#ff6984]" : "text-[var(--heading)]"}`}>
                    {productStock(item) <= 0
                      ? "0 in stock"
                      : item.variants && item.variants.length > 0
                        ? `${productStock(item)} in stock for ${item.variants.length} variants`
                        : `${item.inventory} in stock`}
                  </td>
                  <td className="px-4 py-3">{item.category || "—"}</td>
                  <td className="px-4 py-3">{item.productType || "—"}</td>
                  <td className="px-4 py-3">{formatPrice(item.priceCents)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-sm text-[var(--heading)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(item.id)}
                        className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-sm text-[#ff6984]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <p className="p-6 text-sm">No products yet.</p> : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold text-[var(--heading)]">{value}</div>
    </div>
  );
}
