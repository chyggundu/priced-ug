import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/** How many items one page of the browse grid holds. */
export const PRODUCTS_PAGE_SIZE = 20;

/*
  These read from the same database views the website uses
  (`products_search_view`, `categories`), rather than joining raw tables here.
  The views already fold in the business and category columns and already
  exclude hidden businesses, so both clients see identical rows without
  sharing any code.
*/

/** Mirrors `products_search_view`, matching the website's ProductSearchResult. */
export type Product = {
  id: number;
  businessId: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  size: string | null;
  materials: string | null;
  createdAt: string;
  businessName: string | null;
  businessImageUrl: string | null;
  businessCity: string | null;
};

export type Category = {
  id: number;
  name: string;
  createdAt: string;
};

export type SortBy = "newest" | "priceAsc" | "priceDesc";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapProduct = (r: any): Product => ({
  id: r.id,
  businessId: r.business_id,
  categoryId: r.category_id ?? null,
  categoryName: r.category_name ?? null,
  name: r.name,
  description: r.description ?? null,
  price: r.price ?? null,
  imageUrl: r.image_url ?? null,
  size: r.size ?? null,
  materials: r.materials ?? null,
  createdAt: r.created_at,
  businessName: r.business_name ?? null,
  businessImageUrl: r.business_image_url ?? null,
  businessCity: r.business_city ?? null,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Same digits-only rule the screen used before, kept for price ordering. */
function parsePrice(price?: string | null): number | null {
  if (!price) return null;
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

/*
  PostgREST parses `or=(...)` as a comma-separated list, so a term containing a
  comma, parenthesis or quote would change the filter's meaning rather than
  being matched literally. `%` and `_` go too, so a stray wildcard cannot widen
  the search.
*/
function sanitizeSearch(term: string): string {
  return term.replace(/[,()"'%_\\]/g, " ").trim();
}

/*
  `price` is stored as text, so Postgres cannot order it numerically — "9000"
  would sort above "35000". Newest-first is the default and the only ordering
  the database can paginate correctly today, so it pages 20 at a time. A price
  sort instead pulls one large page and orders it here, exactly as the screen
  did before, which keeps the result correct at the cost of a bigger fetch.
  Paginating price properly needs a numeric column on the view.
*/
const PRICE_SORT_LIMIT = 500;

export type ProductFilters = {
  categoryId?: number | null;
  search?: string;
  city?: string | null;
  sortBy?: SortBy;
};

export function useProducts({
  categoryId,
  search,
  city,
  sortBy = "newest",
}: ProductFilters = {}) {
  const term = sanitizeSearch(search ?? "");
  const paged = sortBy === "newest";

  return useInfiniteQuery({
    queryKey: [
      "products",
      { categoryId: categoryId ?? null, search: term, city: city ?? null, sortBy },
    ],
    enabled: isSupabaseConfigured,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const size = paged ? PRODUCTS_PAGE_SIZE : PRICE_SORT_LIMIT;
      const from = pageParam * size;

      let query = supabase
        .from("products_search_view")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + size - 1);

      if (categoryId) query = query.eq("category_id", categoryId);
      if (city) query = query.eq("business_city", city);

      if (term) {
        const pattern = `%${term}%`;
        query = query.or(
          [
            `name.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `size.ilike.${pattern}`,
            `materials.ilike.${pattern}`,
          ].join(","),
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []).map(mapProduct);
      if (paged) return rows;

      return rows.sort((a, b) => {
        const aPrice = parsePrice(a.price);
        const bPrice = parsePrice(b.price);
        if (aPrice == null && bPrice == null) return 0;
        // Items without a usable price sort last in both directions.
        if (aPrice == null) return 1;
        if (bPrice == null) return -1;
        return sortBy === "priceAsc" ? aPrice - bPrice : bPrice - aPrice;
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!paged) return undefined;
      return lastPage.length < PRODUCTS_PAGE_SIZE ? undefined : allPages.length;
    },
  });
}

/**
 * The Location filter's options. Derived from the loaded feed before, which
 * pagination would have truncated; this asks the database for the distinct set.
 */
export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    enabled: isSupabaseConfigured,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("businesses_view")
        .select("city")
        .eq("is_hidden", false)
        .not("city", "is", null);
      if (error) throw error;

      const seen = new Set<string>();
      for (const row of data ?? []) {
        const city = String((row as { city?: unknown }).city ?? "").trim();
        if (city) seen.add(city);
      }
      return Array.from(seen).sort((a, b) => a.localeCompare(b));
    },
  });
}

/** Categories change rarely, so this is served from cache while it revalidates. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    enabled: isSupabaseConfigured,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((c) => ({
        id: (c as { id: number }).id,
        name: (c as { name: string }).name,
        createdAt: (c as { created_at: string }).created_at,
      }));
    },
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Mirrors `businesses_view`, matching the website's Business shape. */
export type Business = {
  id: number;
  clerkUserId: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  // businesses_view folds the business_categories join into an array; a
  // business can sit in several categories, so there is no single id.
  categories: { id: number; name: string }[];
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isHidden: boolean;
  createdAt: string;
};

const mapBusiness = (r: any): Business => ({
  id: r.id,
  clerkUserId: r.clerk_user_id,
  name: r.name,
  description: r.description ?? null,
  address: r.address ?? null,
  city: r.city ?? null,
  phone: r.phone ?? null,
  categories: (r.categories ?? []) as { id: number; name: string }[],
  imageUrl: r.image_url ?? null,
  latitude: r.latitude ?? null,
  longitude: r.longitude ?? null,
  isHidden: r.is_hidden ?? false,
  createdAt: r.created_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

/** One business by id, for the public business page. */
export function useBusiness(businessId: number | null) {
  return useQuery({
    queryKey: ["business", businessId],
    enabled: isSupabaseConfigured && businessId != null,
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase
        .from("businesses_view")
        .select("*")
        .eq("id", businessId as number)
        .maybeSingle();
      if (error) throw error;
      return data ? mapBusiness(data) : null;
    },
  });
}

/** Every product belonging to one business. */
export function useBusinessProducts(businessId: number | null) {
  return useQuery({
    queryKey: ["business-products", businessId],
    enabled: isSupabaseConfigured && businessId != null,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products_view")
        .select("*")
        .eq("business_id", businessId as number)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
}

/**
 * The signed-in owner's business. RLS already limits rows to the caller, but
 * the Clerk id is passed explicitly so the query key changes on sign-out and
 * the previous owner's row is never served from cache.
 */
export function useMyBusiness(clerkUserId: string | null | undefined) {
  return useQuery({
    queryKey: ["my-business", clerkUserId ?? null],
    enabled: isSupabaseConfigured && !!clerkUserId,
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase
        .from("businesses_view")
        .select("*")
        .eq("clerk_user_id", clerkUserId as string)
        .maybeSingle();
      if (error) throw error;
      return data ? mapBusiness(data) : null;
    },
  });
}
