"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCategories, searchProducts, type Category, type ProductSearchResult } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Notice } from "@/components/dashboard/DashboardShell";

type SortKey = "newest" | "priceAsc" | "priceDesc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "priceAsc", label: "Price: low to high" },
  { key: "priceDesc", label: "Price: high to low" },
];

/** Numbers arrive as free text ("250,000"), so strip anything that is not a digit. */
function parsePrice(price: string | null): number | null {
  if (!price) return null;
  const digits = price.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

/** Mirrors the mobile app's Browse tab: search, category filter, sort, item grid. */
export default function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce so a search does not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured for this build.");
      setLoading(false);
      return;
    }
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    setLoading(true);
    searchProducts({ q: query || undefined, categoryId })
      .then((rows) => active && setProducts(rows))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : "Could not load items."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, categoryId]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortBy === "newest") return list;
    return list.sort((a, b) => {
      const aPrice = parsePrice(a.price);
      const bPrice = parsePrice(b.price);
      if (aPrice == null && bPrice == null) return 0;
      if (aPrice == null) return 1;
      if (bPrice == null) return -1;
      return sortBy === "priceAsc" ? aPrice - bPrice : bPrice - aPrice;
    });
  }, [products, sortBy]);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse</h1>

        <div className="mt-6 flex flex-col gap-4">
          <input
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            type="search"
          />

          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterChip active={categoryId === null} onClick={() => setCategoryId(null)}>
                All
              </FilterChip>
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  active={categoryId === category.id}
                  onClick={() => setCategoryId(category.id)}
                >
                  {category.name}
                </FilterChip>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <FilterChip
                key={option.key}
                active={sortBy === option.key}
                onClick={() => setSortBy(option.key)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6">
            <Notice>{error}</Notice>
          </div>
        )}

        {loading ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="h-64 animate-pulse rounded-[10px] bg-ink-900/5" />
            ))}
          </ul>
        ) : sorted.length === 0 ? (
          <p className="mt-8 text-ink-600">
            {query || categoryId ? "No items match that search." : "No items listed yet."}
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((product) => (
              <li key={product.id} className="relative">
                <FavoriteButton productId={product.id} className="absolute right-3 top-3 z-10" />
                <Link
                  href={`/business?id=${product.businessId}&item=${product.id}`}
                  className="group block overflow-hidden rounded-[10px] border border-line transition duration-300 hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lg hover:shadow-black/5"
                >
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-44 w-full bg-ink-900/5" />
                  )}
                  <div className="p-4">
                    <p className="truncate font-semibold">{product.name}</p>
                    {formatPrice(product.price, product.priceType) && (
                      <p className="mt-1 text-sm font-semibold text-brand-500">
                        {formatPrice(product.price, product.priceType)}
                      </p>
                    )}
                    <p className="mt-1 truncate text-sm text-ink-400">
                      {product.businessName}
                      {product.businessCity ? ` · ${product.businessCity}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function FilterChip({
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
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-brand-500 text-white"
          : "border border-line text-ink-600 hover:border-brand-500 hover:text-brand-500"
      }`}
    >
      {children}
    </button>
  );
}
