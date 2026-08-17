/**
 * Supabase-backed reimplementation of the former Express `/api` client.
 * Same hook names, params, and return types as the old generated client, so
 * app screens are unchanged. Security is enforced by Postgres RLS + RPCs.
 */
import "react-native-url-polyfill/auto";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseQueryResult,
  type UseMutationResult,
  type QueryKey,
} from "@tanstack/react-query";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Business,
  BusinessCategory,
  Category,
  CreateBusinessInput,
  UpdateBusinessInput,
  CreateProductInput,
  UpdateProductInput,
  Product,
  ProductSearchResult,
  Review,
  CreateReviewInput,
  ReplyReviewInput,
  Customer,
  Favorites,
  CustomerProfileInput,
  CustomerLookupInput,
  CreateCategoryInput,
  VisibilityInput,
  UploadUrlInput,
  UploadUrlResponse,
  SuccessResponse,
  GetBusinessesParams,
  GetProductsParams,
} from "./generated/api.schemas";

// ---------------------------------------------------------------------------
// Client + auth wiring
// ---------------------------------------------------------------------------
export type AuthTokenGetter = () => Promise<string | null | undefined>;

let _client: SupabaseClient | null = null;
let _tokenGetter: AuthTokenGetter | null = null;
let _currentUserId: string | null = null;
let _supabaseUrl = "";

/** Initialize the Supabase client once (from app/_layout). */
export function initSupabase(url: string, anonKey: string): void {
  _supabaseUrl = url.replace(/\/+$/, "");
  _client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    // Feed every request the Clerk JWT so RLS sees the user.
    accessToken: async () => (_tokenGetter ? (await _tokenGetter()) ?? null : null),
  });
}

/** Back-compat no-op (old code called setBaseUrl with the API domain). */
export function setBaseUrl(_url: string | null): void {}

/** Register the Clerk token getter — pass () => getToken({ template: "supabase" }). */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _tokenGetter = getter;
}

/** Register the current Clerk user id (from AuthContext) for "me" lookups. */
export function setCurrentUserId(id: string | null): void {
  _currentUserId = id;
}

function sb(): SupabaseClient {
  if (!_client) throw new Error("Supabase client not initialized. Call initSupabase() first.");
  return _client;
}

function requireUserId(): string {
  if (!_currentUserId) throw new ApiError(401, "Not signed in");
  return _currentUserId;
}

const BUCKET = "uploads";

// ---------------------------------------------------------------------------
// Errors — mirror the old ApiError shape (screens read err.status)
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function statusForCode(code?: string): number {
  switch (code) {
    case "42501": // insufficient privilege / RLS / raised auth error
      return 403;
    case "P0002": // no_data_found (raised "not found")
    case "PGRST116": // .single() found no rows
      return 404;
    case "23505": // unique_violation
      return 409;
    case "22023": // invalid_parameter_value
    case "23514": // check_violation
    case "23503": // foreign_key_violation
      return 400;
    default:
      return 400;
  }
}

function raise(error: { code?: string; message?: string } | null): never {
  const status = statusForCode(error?.code);
  throw new ApiError(status, error?.message ?? "Request failed", error);
}

// ---------------------------------------------------------------------------
// Row mappers (snake_case DB → camelCase API types)
// ---------------------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
const mapCategory = (r: any): Category => ({ id: r.id, name: r.name, createdAt: r.created_at });

const mapBusiness = (r: any): Business => ({
  id: r.id,
  clerkUserId: r.clerk_user_id,
  name: r.name,
  description: r.description ?? null,
  address: r.address ?? null,
  city: r.city ?? null,
  phone: r.phone ?? null,
  categories: (r.categories ?? []) as BusinessCategory[],
  imageUrl: r.image_url ?? null,
  latitude: r.latitude ?? null,
  longitude: r.longitude ?? null,
  openingTime: r.opening_time ?? null,
  closingTime: r.closing_time ?? null,
  minPrice: r.min_price ?? null,
  isHidden: r.is_hidden,
  createdAt: r.created_at,
});

const mapProduct = (r: any): Product => ({
  id: r.id,
  businessId: r.business_id,
  categoryId: r.category_id ?? null,
  categoryName: r.category_name ?? null,
  name: r.name,
  description: r.description ?? null,
  price: r.price ?? null,
  priceType: r.price_type ?? null,
  imageUrl: r.image_url ?? null,
  imageUrls: (r.image_urls ?? []) as string[],
  videoUrl: r.video_url ?? null,
  size: r.size ?? null,
  materials: r.materials ?? null,
  color: r.color ?? null,
  condition: r.condition ?? null,
  deliveredByPricedUg: r.delivered_by_priced_ug,
  deliveredByBusiness: r.delivered_by_business ?? false,
  createdAt: r.created_at,
});

const mapProductSearch = (r: any): ProductSearchResult => ({
  ...mapProduct(r),
  businessName: r.business_name,
  businessImageUrl: r.business_image_url ?? null,
  businessCity: r.business_city ?? null,
});

const mapReview = (r: any): Review => ({
  id: r.id,
  businessId: r.business_id,
  authorName: r.author_name,
  rating: r.rating,
  comment: r.comment ?? null,
  reply: r.reply ?? null,
  repliedAt: r.replied_at ?? null,
  createdAt: r.created_at,
  isMine: !!r.is_mine,
});

const mapCustomer = (r: any): Customer => ({
  id: r.id,
  fullName: r.full_name,
  phone: r.phone,
  district: r.district,
  town: r.town ?? null,
  village: r.village ?? null,
  street: r.street ?? null,
  addressPhotoUrl: r.address_photo_url ?? null,
  latitude: r.latitude ?? null,
  longitude: r.longitude ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Generic hook helpers
// ---------------------------------------------------------------------------
type QueryOpts<T> = { query?: Partial<UseQueryOptions<T, ApiError, T>> };
type MutOpts<TData, TVars> = { mutation?: UseMutationOptions<TData, ApiError, TVars> };

function useApiQuery<T>(
  queryKey: QueryKey,
  fn: () => Promise<T>,
  options?: QueryOpts<T>,
): UseQueryResult<T, ApiError> & { queryKey: QueryKey } {
  const query = useQuery<T, ApiError>({
    queryKey,
    queryFn: fn,
    ...(options?.query ?? {}),
  }) as UseQueryResult<T, ApiError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

function useApiMutation<TData, TVars>(
  fn: (vars: TVars) => Promise<TData>,
  invalidate: (qc: ReturnType<typeof useQueryClient>, vars: TVars) => void,
  options?: MutOpts<TData, TVars>,
): UseMutationResult<TData, ApiError, TVars> {
  const qc = useQueryClient();
  return useMutation<TData, ApiError, TVars>({
    mutationFn: fn,
    ...(options?.mutation ?? {}),
    onSuccess: (data, vars, ...rest) => {
      invalidate(qc, vars);
      (options?.mutation?.onSuccess as ((...a: unknown[]) => unknown) | undefined)?.(
        data, vars, ...rest,
      );
    },
  });
}

// small uuid (object keys only)
function uuid(): string {
  const g = (globalThis as any).crypto;
  if (g?.randomUUID) return g.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function myBusinessId(): Promise<number | null> {
  const uid = requireUserId();
  const { data, error } = await sb().from("businesses").select("id").eq("clerk_user_id", uid).maybeSingle();
  if (error) raise(error);
  return data ? (data as any).id : null;
}

// ===========================================================================
// CATEGORIES
// ===========================================================================
export function useGetCategories(options?: QueryOpts<Category[]>) {
  return useApiQuery<Category[]>(["categories"], async () => {
    const { data, error } = await sb().from("categories").select("*").order("name");
    if (error) raise(error);
    return (data ?? []).map(mapCategory);
  }, options);
}

export function useCreateCategory(options?: MutOpts<Category, { data: CreateCategoryInput }>) {
  return useApiMutation<Category, { data: CreateCategoryInput }>(
    async ({ data }) => {
      const { data: row, error } = await sb().from("categories").insert({ name: data.name }).select().single();
      if (error) raise(error);
      return mapCategory(row);
    },
    (qc) => qc.invalidateQueries({ queryKey: ["categories"] }),
    options,
  );
}

export function useDeleteCategory(options?: MutOpts<SuccessResponse, { id: number }>) {
  return useApiMutation<SuccessResponse, { id: number }>(
    async ({ id }) => {
      const { error } = await sb().from("categories").delete().eq("id", id);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: ["categories"] }),
    options,
  );
}

// ===========================================================================
// BUSINESSES
// ===========================================================================
export function useGetBusinesses(params?: GetBusinessesParams, options?: QueryOpts<Business[]>) {
  return useApiQuery<Business[]>(["businesses", params ?? {}], async () => {
    let q = sb().from("businesses_view").select("*").eq("is_hidden", false);
    if (params?.search) {
      const p = `%${params.search}%`;
      q = q.or(`name.ilike.${p},description.ilike.${p}`);
    }
    const { data, error } = await q.order("id");
    if (error) raise(error);
    let list = (data ?? []).map(mapBusiness);
    if (params?.categoryId != null) {
      list = list.filter((b) => (b.categories ?? []).some((c) => c.id === params.categoryId));
    }
    return list;
  }, options);
}

export function useGetAdminBusinesses(options?: QueryOpts<Business[]>) {
  return useApiQuery<Business[]>(["adminBusinesses"], async () => {
    const { data, error } = await sb().from("businesses_view").select("*").order("id");
    if (error) raise(error);
    return (data ?? []).map(mapBusiness);
  }, options);
}

export function useGetBusiness(id: number, options?: QueryOpts<Business>) {
  return useApiQuery<Business>(["business", id], async () => {
    const { data, error } = await sb().from("businesses_view").select("*").eq("id", id).maybeSingle();
    if (error) raise(error);
    if (!data) throw new ApiError(404, "Business not found");
    return mapBusiness(data);
  }, options);
}

export function useGetMyBusiness(options?: QueryOpts<Business | null>) {
  return useApiQuery<Business | null>(["myBusiness"], async () => {
    const uid = requireUserId();
    const { data, error } = await sb().from("businesses_view").select("*").eq("clerk_user_id", uid).maybeSingle();
    if (error) raise(error);
    return data ? mapBusiness(data) : null;
  }, options);
}

function businessInsertPayload(data: CreateBusinessInput | UpdateBusinessInput) {
  const out: Record<string, unknown> = {};
  const src = data as Record<string, unknown>;
  for (const [k, dbk] of [
    ["name", "name"], ["description", "description"], ["address", "address"],
    ["city", "city"], ["phone", "phone"], ["imageUrl", "image_url"],
    ["latitude", "latitude"], ["longitude", "longitude"],
    ["openingTime", "opening_time"], ["closingTime", "closing_time"],
  ] as const) {
    if (src[k] !== undefined) out[dbk] = src[k];
  }
  return out;
}

export function useCreateBusiness(options?: MutOpts<Business, { data: CreateBusinessInput }>) {
  return useApiMutation<Business, { data: CreateBusinessInput }>(
    async ({ data }) => {
      const uid = requireUserId();
      const { data: row, error } = await sb()
        .from("businesses")
        .insert({ ...businessInsertPayload(data), clerk_user_id: uid })
        .select()
        .single();
      if (error) raise(error);
      return mapBusiness(row);
    },
    (qc) => {
      qc.invalidateQueries({ queryKey: ["myBusiness"] });
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
    options,
  );
}

export function useUpdateMyBusiness(options?: MutOpts<Business, { data: UpdateBusinessInput }>) {
  return useApiMutation<Business, { data: UpdateBusinessInput }>(
    async ({ data }) => {
      const uid = requireUserId();
      const { error } = await sb().from("businesses").update(businessInsertPayload(data)).eq("clerk_user_id", uid);
      if (error) raise(error);
      const { data: row, error: e2 } = await sb().from("businesses_view").select("*").eq("clerk_user_id", uid).maybeSingle();
      if (e2) raise(e2);
      if (!row) throw new ApiError(404, "Business not found");
      return mapBusiness(row);
    },
    (qc) => {
      qc.invalidateQueries({ queryKey: ["myBusiness"] });
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
    options,
  );
}

export function useToggleBusinessVisibility(options?: MutOpts<Business, { id: number; data: VisibilityInput }>) {
  return useApiMutation<Business, { id: number; data: VisibilityInput }>(
    async ({ id, data }) => {
      const { error } = await sb().from("businesses").update({ is_hidden: data.isHidden }).eq("id", id);
      if (error) raise(error);
      const { data: row, error: e2 } = await sb().from("businesses_view").select("*").eq("id", id).maybeSingle();
      if (e2) raise(e2);
      if (!row) throw new ApiError(404, "Business not found");
      return mapBusiness(row);
    },
    (qc) => {
      qc.invalidateQueries({ queryKey: ["adminBusinesses"] });
      qc.invalidateQueries({ queryKey: ["businesses"] });
      qc.invalidateQueries({ queryKey: ["business"] });
    },
    options,
  );
}

// Admin: delete a business and all of its dependent rows via SECURITY DEFINER
// RPC (children have no cascading FK to businesses, so a plain delete would
// orphan products/reviews). The RPC re-checks is_admin() server-side.
export function useAdminDeleteBusiness(options?: MutOpts<SuccessResponse, { id: number }>) {
  return useApiMutation<SuccessResponse, { id: number }>(
    async ({ id }) => {
      const { error } = await sb().rpc("admin_delete_business", { business_id: id });
      if (error) raise(error);
      return { success: true };
    },
    (qc) => {
      qc.invalidateQueries({ queryKey: ["adminBusinesses"] });
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
    options,
  );
}

// ===========================================================================
// PRODUCTS
// ===========================================================================
export function useGetProducts(params?: GetProductsParams, options?: QueryOpts<ProductSearchResult[]>) {
  return useApiQuery<ProductSearchResult[]>(["products", params ?? {}], async () => {
    let q = sb().from("products_search_view").select("*");
    if (params?.categoryId != null) q = q.eq("category_id", params.categoryId);
    if (params?.q) {
      const p = `%${params.q}%`;
      q = q.or(`name.ilike.${p},description.ilike.${p},size.ilike.${p},materials.ilike.${p}`);
    }
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) raise(error);
    return (data ?? []).map(mapProductSearch);
  }, options);
}

export function useGetBusinessProducts(businessId: number, options?: QueryOpts<Product[]>) {
  return useApiQuery<Product[]>(["businessProducts", businessId], async () => {
    const { data, error } = await sb()
      .from("products_view").select("*").eq("business_id", businessId).order("created_at", { ascending: true });
    if (error) raise(error);
    return (data ?? []).map(mapProduct);
  }, options);
}

export function useGetMyProducts(options?: QueryOpts<Product[]>) {
  return useApiQuery<Product[]>(["myProducts"], async () => {
    const bid = await myBusinessId();
    if (bid == null) return [];
    const { data, error } = await sb()
      .from("products_view").select("*").eq("business_id", bid).order("created_at", { ascending: true });
    if (error) raise(error);
    return (data ?? []).map(mapProduct);
  }, options);
}

function productPayload(data: CreateProductInput | UpdateProductInput) {
  const out: Record<string, unknown> = {};
  const src = data as Record<string, unknown>;
  for (const [k, dbk] of [
    ["name", "name"], ["categoryId", "category_id"], ["description", "description"],
    ["price", "price"], ["priceType", "price_type"], ["imageUrl", "image_url"], ["imageUrls", "image_urls"], ["videoUrl", "video_url"], ["size", "size"],
    ["materials", "materials"], ["color", "color"], ["condition", "condition"],
    ["deliveredByPricedUg", "delivered_by_priced_ug"],
    ["deliveredByBusiness", "delivered_by_business"],
  ] as const) {
    if (src[k] !== undefined) out[dbk] = src[k];
  }
  return out;
}

export function useCreateProduct(options?: MutOpts<Product, { data: CreateProductInput }>) {
  return useApiMutation<Product, { data: CreateProductInput }>(
    async ({ data }) => {
      const bid = await myBusinessId();
      if (bid == null) throw new ApiError(404, "Create a business page first");
      const { data: row, error } = await sb()
        .from("products").insert({ ...productPayload(data), business_id: bid }).select().single();
      if (error) raise(error);
      return mapProduct(row);
    },
    (qc) => qc.invalidateQueries({ queryKey: ["myProducts"] }),
    options,
  );
}

export function useUpdateProduct(options?: MutOpts<Product, { productId: number; data: UpdateProductInput }>) {
  return useApiMutation<Product, { productId: number; data: UpdateProductInput }>(
    async ({ productId, data }) => {
      const { data: row, error } = await sb()
        .from("products").update(productPayload(data)).eq("id", productId).select().single();
      if (error) raise(error);
      return mapProduct(row);
    },
    (qc, { productId }) => {
      qc.invalidateQueries({ queryKey: ["myProducts"] });
      qc.invalidateQueries({ queryKey: ["businessProducts"] });
      void productId;
    },
    options,
  );
}

export function useDeleteProduct(options?: MutOpts<SuccessResponse, { productId: number }>) {
  return useApiMutation<SuccessResponse, { productId: number }>(
    async ({ productId }) => {
      const { error } = await sb().from("products").delete().eq("id", productId);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => {
      qc.invalidateQueries({ queryKey: ["myProducts"] });
      qc.invalidateQueries({ queryKey: ["businessProducts"] });
    },
    options,
  );
}

// admin delete is the same table delete; RLS admin policy authorizes it
export function useAdminDeleteProduct(options?: MutOpts<SuccessResponse, { productId: number }>) {
  return useApiMutation<SuccessResponse, { productId: number }>(
    async ({ productId }) => {
      const { error } = await sb().from("products").delete().eq("id", productId);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => {
      qc.invalidateQueries({ queryKey: ["businessProducts"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    options,
  );
}

// ===========================================================================
// REVIEWS
// ===========================================================================
export function useGetBusinessReviews(businessId: number, options?: QueryOpts<Review[]>) {
  return useApiQuery<Review[]>(["reviews", businessId], async () => {
    const { data, error } = await sb()
      .from("reviews_view").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
    if (error) raise(error);
    return (data ?? []).map(mapReview);
  }, options);
}

export function useCreateReview(options?: MutOpts<Review, { businessId: number; data: CreateReviewInput }>) {
  return useApiMutation<Review, { businessId: number; data: CreateReviewInput }>(
    async ({ businessId, data }) => {
      const { data: row, error } = await sb().rpc("create_review", {
        business_id: businessId,
        rating: data.rating,
        comment: data.comment ?? null,
      });
      if (error) raise(error);
      return mapReview(row);
    },
    (qc, { businessId }) => qc.invalidateQueries({ queryKey: ["reviews", businessId] }),
    options,
  );
}

export function useReplyToReview(options?: MutOpts<Review, { reviewId: number; data: ReplyReviewInput }>) {
  return useApiMutation<Review, { reviewId: number; data: ReplyReviewInput }>(
    async ({ reviewId, data }) => {
      const { data: row, error } = await sb().rpc("reply_to_review", { review_id: reviewId, reply: data.reply });
      if (error) raise(error);
      return mapReview(row);
    },
    (qc) => qc.invalidateQueries({ queryKey: ["reviews"] }),
    options,
  );
}

export function useDeleteReview(options?: MutOpts<SuccessResponse, { reviewId: number }>) {
  return useApiMutation<SuccessResponse, { reviewId: number }>(
    async ({ reviewId }) => {
      const { error } = await sb().from("reviews").delete().eq("id", reviewId);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: ["reviews"] }),
    options,
  );
}

// ===========================================================================
// CUSTOMERS
// ===========================================================================
export function useGetMyCustomerProfile(options?: QueryOpts<Customer | null>) {
  return useApiQuery<Customer | null>(["myCustomer"], async () => {
    const uid = requireUserId();
    const { data, error } = await sb().from("customers").select("*").eq("clerk_user_id", uid).maybeSingle();
    if (error) raise(error);
    return data ? mapCustomer(data) : null;
  }, options);
}

export function useSaveMyCustomerProfile(options?: MutOpts<Customer, { data: CustomerProfileInput }>) {
  return useApiMutation<Customer, { data: CustomerProfileInput }>(
    async ({ data }) => {
      const uid = requireUserId();
      const payload = {
        clerk_user_id: uid,
        full_name: data.fullName,
        phone: data.phone,
        district: data.district,
        town: data.town ?? null,
        village: data.village ?? null,
        street: data.street ?? null,
        address_photo_url: data.addressPhotoUrl ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      };
      const { data: row, error } = await sb()
        .from("customers").upsert(payload, { onConflict: "clerk_user_id" }).select().single();
      if (error) raise(error);
      return mapCustomer(row);
    },
    (qc) => qc.invalidateQueries({ queryKey: ["myCustomer"] }),
    options,
  );
}

export function useLookupCustomer(options?: MutOpts<Customer, { data: CustomerLookupInput }>) {
  return useApiMutation<Customer, { data: CustomerLookupInput }>(
    async ({ data }) => {
      const { data: row, error } = await sb().rpc("lookup_customer", {
        phone: data.phone,
        district: data.district,
      });
      if (error) raise(error);
      if (!row) throw new ApiError(404, "Customer not found");
      return mapCustomer(row);
    },
    () => {},
    options,
  );
}

export function useGetAdminCustomers(options?: QueryOpts<Customer[]>) {
  return useApiQuery<Customer[]>(["adminCustomers"], async () => {
    const { data, error } = await sb().from("customers_view").select("*").order("created_at", { ascending: false });
    if (error) raise(error);
    return (data ?? []).map(mapCustomer);
  }, options);
}

// Admin: delete a customer delivery profile (plain row delete; RLS admin policy
// authorizes it — mirrors useAdminDeleteProduct).
export function useAdminDeleteCustomer(options?: MutOpts<SuccessResponse, { id: number }>) {
  return useApiMutation<SuccessResponse, { id: number }>(
    async ({ id }) => {
      const { error } = await sb().from("customers").delete().eq("id", id);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: ["adminCustomers"] }),
    options,
  );
}

// ===========================================================================
// FAVORITES
// ===========================================================================
// One `favorites` row per (user, business) or (user, product). Reads are
// scoped to the signed-in user by RLS. useGetFavorites resolves the saved ids
// into full Business / ProductSearchResult objects so screens render directly.
export function getGetFavoritesQueryKey(): QueryKey {
  return ["favorites"];
}

export function useGetFavorites(options?: QueryOpts<Favorites>) {
  return useApiQuery<Favorites>(getGetFavoritesQueryKey(), async () => {
    const { data: rows, error } = await sb()
      .from("favorites").select("business_id, product_id");
    if (error) raise(error);
    const businessIds = (rows ?? []).map((r: any) => r.business_id).filter((v: number | null) => v != null);
    const productIds = (rows ?? []).map((r: any) => r.product_id).filter((v: number | null) => v != null);

    let businesses: Business[] = [];
    if (businessIds.length > 0) {
      const { data, error: e } = await sb().from("businesses_view").select("*").in("id", businessIds);
      if (e) raise(e);
      businesses = (data ?? []).map(mapBusiness);
    }

    let products: ProductSearchResult[] = [];
    if (productIds.length > 0) {
      const { data, error: e } = await sb().from("products_search_view").select("*").in("id", productIds);
      if (e) raise(e);
      products = (data ?? []).map(mapProductSearch);
    }

    return { businesses, products };
  }, options);
}

export function useAddFavoriteBusiness(options?: MutOpts<SuccessResponse, { businessId: number }>) {
  return useApiMutation<SuccessResponse, { businessId: number }>(
    async ({ businessId }) => {
      const uid = requireUserId();
      const { error } = await sb().from("favorites").insert({ clerk_user_id: uid, business_id: businessId });
      if (error && error.code !== "23505") raise(error); // ignore "already favorited"
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
    options,
  );
}

export function useRemoveFavoriteBusiness(options?: MutOpts<SuccessResponse, { businessId: number }>) {
  return useApiMutation<SuccessResponse, { businessId: number }>(
    async ({ businessId }) => {
      const uid = requireUserId();
      const { error } = await sb().from("favorites").delete()
        .eq("clerk_user_id", uid).eq("business_id", businessId);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
    options,
  );
}

export function useAddFavoriteProduct(options?: MutOpts<SuccessResponse, { productId: number }>) {
  return useApiMutation<SuccessResponse, { productId: number }>(
    async ({ productId }) => {
      const uid = requireUserId();
      const { error } = await sb().from("favorites").insert({ clerk_user_id: uid, product_id: productId });
      if (error && error.code !== "23505") raise(error);
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
    options,
  );
}

export function useRemoveFavoriteProduct(options?: MutOpts<SuccessResponse, { productId: number }>) {
  return useApiMutation<SuccessResponse, { productId: number }>(
    async ({ productId }) => {
      const uid = requireUserId();
      const { error } = await sb().from("favorites").delete()
        .eq("clerk_user_id", uid).eq("product_id", productId);
      if (error) raise(error);
      return { success: true };
    },
    (qc) => qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
    options,
  );
}

// ===========================================================================
// ACCOUNT DELETION (Apple Guideline 5.1.1(v))
// ===========================================================================
// Permanently deletes ALL data keyed to the signed-in user: their business,
// its products, reviews they authored, and their customer profile. The Clerk
// account itself is deleted client-side via user.delete() after this resolves.
export function useDeleteMyAccount(options?: MutOpts<SuccessResponse, void>) {
  return useApiMutation<SuccessResponse, void>(
    async () => {
      requireUserId();
      const { error } = await sb().rpc("delete_my_account");
      if (error) raise(error);
      return { success: true };
    },
    (qc) => qc.clear(),
    options,
  );
}

// ===========================================================================
// STORAGE — signed upload URL (same {uploadUrl, publicUrl} shape as before)
// ===========================================================================
export function useGetUploadUrl(options?: MutOpts<UploadUrlResponse, { data: UploadUrlInput }>) {
  return useApiMutation<UploadUrlResponse, { data: UploadUrlInput }>(
    async ({ data }) => {
      const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${uuid()}.${ext}`;
      const { data: signed, error } = await sb().storage.from(BUCKET).createSignedUploadUrl(path);
      // Storage errors carry an HTTP status; keep it instead of assuming RLS,
      // so a 401 (bad/absent token) isn't reported as a permission problem.
      if (error) {
        const status = (error as { status?: number }).status ?? 403;
        throw new ApiError(status, error.message, error);
      }
      // Build the PUT target deterministically (token carries auth).
      const uploadUrl = `${_supabaseUrl}/storage/v1/object/upload/sign/${BUCKET}/${path}?token=${signed!.token}`;
      const publicUrl = sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      return { uploadUrl, publicUrl };
    },
    () => {},
    options,
  );
}

// ===========================================================================
// HEALTH (kept for parity)
// ===========================================================================
export function useHealthCheck(options?: QueryOpts<{ status: string }>) {
  return useApiQuery<{ status: string }>(["health"], async () => ({ status: "ok" }), options);
}
