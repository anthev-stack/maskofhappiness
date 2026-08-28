"use client";

import { useMemo, useState } from "react";
import { ShopProductCard } from "@/components/shop-product-card";

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  inventory: number;
  category: string;
  productType: string;
  createdAt?: string;
  variants: { name: string; inventory: number }[];
};

type SortKey = "relevant" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevant", label: "Most relevant" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name" },
];

export function ShopCatalog({ products }: { products: CatalogProduct[] }) {
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevant");

  const categories = [...new Set(products.map((item) => item.category).filter(Boolean))].sort();
  const types = [...new Set(products.map((item) => item.productType).filter(Boolean))].sort();
  const sizes = [
    ...new Set(products.flatMap((item) => item.variants.map((variant) => variant.name)).filter(Boolean)),
  ].sort();

  const filtered = useMemo(() => {
    const list = products.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (type !== "all" && item.productType !== type) return false;
      if (size !== "all" && !item.variants.some((variant) => variant.name === size)) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-desc") sorted.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [products, category, type, size, sort]);

  return (
    <div>
      <div className="relative flex items-center justify-between gap-3 border-b border-[var(--border)] py-3">
        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            setSortOpen(false);
          }}
          className="inline-flex items-center gap-2 text-sm font-light uppercase tracking-wide text-[var(--muted)] hover:text-[var(--heading)]"
        >
          Filter
          <span className="flex flex-col gap-0.5" aria-hidden>
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-3 bg-current" />
            <span className="block h-px w-2 bg-current" />
          </span>
          <span className={`text-xs transition-transform ${open ? "rotate-90" : "-rotate-90"}`}>‹</span>
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 text-sm text-[var(--muted)]">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
        <button
          type="button"
          onClick={() => {
            setSortOpen((value) => !value);
            setOpen(false);
          }}
          className="inline-flex items-center gap-2 text-sm font-light uppercase tracking-wide text-[var(--muted)] hover:text-[var(--heading)]"
        >
          {SORT_OPTIONS.find((option) => option.key === sort)?.label}
          <span className={`text-xs transition-transform ${sortOpen ? "rotate-90" : "-rotate-90"}`}>‹</span>
        </button>
      </div>

      {open ? (
        <div className="flex flex-wrap gap-10 py-6">
          <FilterGroup label="Category" value={category} onChange={setCategory} options={categories} />
          <FilterGroup label="Product type" value={type} onChange={setType} options={types} />
          {sizes.length > 0 ? <FilterGroup label="Size" value={size} onChange={setSize} options={sizes} /> : null}
        </div>
      ) : null}

      {sortOpen ? (
        <div className="flex justify-end py-6">
          <div className="space-y-2 text-right">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setSort(option.key);
                  setSortOpen(false);
                }}
                className={`block w-full text-right text-sm uppercase tracking-wide ${
                  sort === option.key ? "text-[var(--heading)]" : "text-[var(--muted)] hover:text-[var(--heading)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-10 text-sm text-[var(--muted)]">No products match those filters.</p>
      ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-6 md:grid-cols-5">
            {filtered.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="min-w-[140px]">
      <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <div className="space-y-1">
        <FilterButton active={value === "all"} onClick={() => onChange("all")}>
          All
        </FilterButton>
        {options.map((option) => (
          <FilterButton key={option} active={value === option} onClick={() => onChange(option)}>
            {option}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block text-left text-sm uppercase tracking-wide ${
        active ? "text-[var(--heading)]" : "text-[var(--muted)] hover:text-[var(--heading)]"
      }`}
    >
      {children}
    </button>
  );
}
