import { BUCKET, getCurrentUserId, sb, supabaseUrl } from "./supabase";

/**
 * Data access for the website. Field names match the mobile app's client so the
 * two stay readable side by side, but this is the site's own implementation —
 * nothing is imported from lib/.
 */

export type Category = { id: number; name: string };

export type Business = {
  id: number;
  clerkUserId: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  categories: { id: number; name: string }[];
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  openingTime: string | null;
  closingTime: string | null;
  isHidden: boolean;
  createdAt: string;
};

export type Product = {
  id: number;
  businessId: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  price: string | null;
  priceType: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  size: string | null;
  materials: string | null;
  color: string | null;
  condition: string | null;
  deliveredByPricedUg: boolean;
  deliveredByBusiness: boolean;
  createdAt: string;
};

export type BusinessInput = {
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
};

export type ProductInput = {
  name: string;
  categoryId: number;
  description?: string | null;
  price?: string | null;
  priceType?: string | null;
  size?: string | null;
  materials?: string | null;
  color?: string | null;
  condition?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrl?: string | null;
  deliveredByPricedUg?: boolean;
  deliveredByBusiness?: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  openingTime: r.opening_time ?? null,
  closingTime: r.closing_time ?? null,
  isHidden: r.is_hidden ?? false,
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
  deliveredByPricedUg: r.delivered_by_priced_ug ?? false,
  deliveredByBusiness: r.delivered_by_business ?? false,
  createdAt: r.created_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

function raise(error: { message: string }): never {
  throw new Error(error.message);
}

function requireUserId(): string {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Not signed in");
  return uid;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await sb().from("categories").select("*").order("name");
  if (error) raise(error);
  return (data ?? []).map((r: { id: number; name: string }) => ({ id: r.id, name: r.name }));
}

export type ProductSearchResult = Product & {
  businessName: string;
  businessImageUrl: string | null;
  businessCity: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapProductSearch = (r: any): ProductSearchResult => ({
  ...mapProduct(r),
  businessName: r.business_name,
  businessImageUrl: r.business_image_url ?? null,
  businessCity: r.business_city ?? null,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getBusinesses(search?: string): Promise<Business[]> {
  let query = sb().from("businesses_view").select("*").eq("is_hidden", false);
  if (search) {
    const pattern = `%${search}%`;
    query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`);
  }
  const { data, error } = await query.order("id");
  if (error) raise(error);
  return (data ?? []).map(mapBusiness);
}

export async function getBusiness(id: number): Promise<Business> {
  const { data, error } = await sb()
    .from("businesses_view")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) raise(error);
  if (!data) throw new Error("Business not found");
  return mapBusiness(data);
}

export async function getBusinessProducts(businessId: number): Promise<Product[]> {
  const { data, error } = await sb()
    .from("products_view")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });
  if (error) raise(error);
  return (data ?? []).map(mapProduct);
}

/** The browse feed: every product, with its business, newest first. */
export async function searchProducts(params: {
  q?: string;
  categoryId?: number | null;
}): Promise<ProductSearchResult[]> {
  let query = sb().from("products_search_view").select("*");
  if (params.categoryId != null) query = query.eq("category_id", params.categoryId);
  if (params.q) {
    const pattern = `%${params.q}%`;
    query = query.or(
      `name.ilike.${pattern},description.ilike.${pattern},size.ilike.${pattern},materials.ilike.${pattern}`,
    );
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) raise(error);
  return (data ?? []).map(mapProductSearch);
}

export async function getProduct(productId: number): Promise<Product> {
  const { data, error } = await sb()
    .from("products_view")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  if (error) raise(error);
  if (!data) throw new Error("Item not found");
  return mapProduct(data);
}

export type Favorites = { businesses: Business[]; products: Product[] };

export async function getFavorites(): Promise<Favorites> {
  const { data: rows, error } = await sb().from("favorites").select("business_id, product_id");
  if (error) raise(error);

  const businessIds = (rows ?? [])
    .map((r: { business_id: number | null }) => r.business_id)
    .filter((v): v is number => v != null);
  const productIds = (rows ?? [])
    .map((r: { product_id: number | null }) => r.product_id)
    .filter((v): v is number => v != null);

  const [businesses, products] = await Promise.all([
    businessIds.length
      ? sb()
          .from("businesses_view")
          .select("*")
          .in("id", businessIds)
          .then(({ data, error: e }) => {
            if (e) raise(e);
            return (data ?? []).map(mapBusiness);
          })
      : Promise.resolve<Business[]>([]),
    productIds.length
      ? sb()
          .from("products_search_view")
          .select("*")
          .in("id", productIds)
          .then(({ data, error: e }) => {
            if (e) raise(e);
            return (data ?? []).map(mapProduct);
          })
      : Promise.resolve<Product[]>([]),
  ]);

  return { businesses, products };
}

export async function addFavorite(target: { businessId?: number; productId?: number }): Promise<void> {
  const uid = requireUserId();
  const { error } = await sb().from("favorites").insert({
    clerk_user_id: uid,
    business_id: target.businessId ?? null,
    product_id: target.productId ?? null,
  });
  // 23505 = already favourited, which is the desired end state anyway.
  if (error && error.code !== "23505") raise(error);
}

export async function removeFavorite(target: {
  businessId?: number;
  productId?: number;
}): Promise<void> {
  const uid = requireUserId();
  let query = sb().from("favorites").delete().eq("clerk_user_id", uid);
  query = target.businessId != null
    ? query.eq("business_id", target.businessId)
    : query.eq("product_id", target.productId!);
  const { error } = await query;
  if (error) raise(error);
}

export async function getMyBusiness(): Promise<Business | null> {
  const uid = requireUserId();
  const { data, error } = await sb()
    .from("businesses_view")
    .select("*")
    .eq("clerk_user_id", uid)
    .maybeSingle();
  if (error) raise(error);
  return data ? mapBusiness(data) : null;
}

function businessPayload(input: BusinessInput) {
  const src = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, column] of [
    ["name", "name"],
    ["description", "description"],
    ["address", "address"],
    ["city", "city"],
    ["phone", "phone"],
    ["imageUrl", "image_url"],
    ["openingTime", "opening_time"],
    ["closingTime", "closing_time"],
  ] as const) {
    if (src[key] !== undefined) out[column] = src[key];
  }
  return out;
}

export async function createBusiness(input: BusinessInput): Promise<Business> {
  const uid = requireUserId();
  const { data, error } = await sb()
    .from("businesses")
    .insert({ ...businessPayload(input), clerk_user_id: uid })
    .select()
    .single();
  if (error) raise(error);
  return mapBusiness(data);
}

export async function updateMyBusiness(id: number, input: BusinessInput): Promise<Business> {
  const { data, error } = await sb()
    .from("businesses")
    .update(businessPayload(input))
    .eq("id", id)
    .select()
    .single();
  if (error) raise(error);
  return mapBusiness(data);
}

export async function getMyProducts(businessId: number): Promise<Product[]> {
  const { data, error } = await sb()
    .from("products_view")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });
  if (error) raise(error);
  return (data ?? []).map(mapProduct);
}

function productPayload(input: ProductInput) {
  const src = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, column] of [
    ["name", "name"],
    ["categoryId", "category_id"],
    ["description", "description"],
    ["price", "price"],
    ["priceType", "price_type"],
    ["imageUrl", "image_url"],
    ["imageUrls", "image_urls"],
    ["videoUrl", "video_url"],
    ["size", "size"],
    ["materials", "materials"],
    ["color", "color"],
    ["condition", "condition"],
    ["deliveredByPricedUg", "delivered_by_priced_ug"],
    ["deliveredByBusiness", "delivered_by_business"],
  ] as const) {
    if (src[key] !== undefined) out[column] = src[key];
  }
  return out;
}

export async function createProduct(businessId: number, input: ProductInput): Promise<Product> {
  const { data, error } = await sb()
    .from("products")
    .insert({ ...productPayload(input), business_id: businessId })
    .select()
    .single();
  if (error) raise(error);
  return mapProduct(data);
}

export async function updateProduct(productId: number, input: ProductInput): Promise<Product> {
  const { data, error } = await sb()
    .from("products")
    .update(productPayload(input))
    .eq("id", productId)
    .select()
    .single();
  if (error) raise(error);
  return mapProduct(data);
}

export async function deleteProduct(productId: number): Promise<void> {
  const { error } = await sb().from("products").delete().eq("id", productId);
  if (error) raise(error);
}

/* ------------------------------------------------------------------ reviews */

export type Review = {
  id: number;
  businessId: number;
  authorName: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  isMine: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
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
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getBusinessReviews(businessId: number): Promise<Review[]> {
  const { data, error } = await sb()
    .from("reviews_view")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) raise(error);
  return (data ?? []).map(mapReview);
}

/** Server-side RPC: it stamps the author from the JWT and enforces one per user. */
export async function createReview(
  businessId: number,
  input: { rating: number; comment?: string | null },
): Promise<Review> {
  const { data, error } = await sb().rpc("create_review", {
    business_id: businessId,
    rating: input.rating,
    comment: input.comment ?? null,
  });
  if (error) raise(error);
  return mapReview(data);
}

export async function replyToReview(reviewId: number, reply: string): Promise<Review> {
  const { data, error } = await sb().rpc("reply_to_review", { review_id: reviewId, reply });
  if (error) raise(error);
  return mapReview(data);
}

export async function deleteReview(reviewId: number): Promise<void> {
  const { error } = await sb().from("reviews").delete().eq("id", reviewId);
  if (error) raise(error);
}

/* ---------------------------------------------------------------- customers */

export type Customer = {
  id: number;
  fullName: string;
  phone: string;
  district: string;
  town: string | null;
  village: string | null;
  street: string | null;
  addressPhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = {
  fullName: string;
  phone: string;
  district: string;
  town?: string | null;
  village?: string | null;
  street?: string | null;
  addressPhotoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function getMyCustomerProfile(): Promise<Customer | null> {
  const uid = requireUserId();
  const { data, error } = await sb()
    .from("customers")
    .select("*")
    .eq("clerk_user_id", uid)
    .maybeSingle();
  if (error) raise(error);
  return data ? mapCustomer(data) : null;
}

export async function saveMyCustomerProfile(input: CustomerInput): Promise<Customer> {
  const uid = requireUserId();
  const { data, error } = await sb()
    .from("customers")
    .upsert(
      {
        clerk_user_id: uid,
        full_name: input.fullName,
        phone: input.phone,
        district: input.district,
        town: input.town ?? null,
        village: input.village ?? null,
        street: input.street ?? null,
        address_photo_url: input.addressPhotoUrl ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      },
      { onConflict: "clerk_user_id" },
    )
    .select()
    .single();
  if (error) raise(error);
  return mapCustomer(data);
}

/** Businesses look a customer up by phone + district to arrange a delivery. */
export async function lookupCustomer(phone: string, district: string): Promise<Customer> {
  const { data, error } = await sb().rpc("lookup_customer", { phone, district });
  if (error) raise(error);
  if (!data) throw new Error("Customer not found");
  return mapCustomer(data);
}

/* -------------------------------------------------------------------- admin */

export async function getAdminBusinesses(): Promise<Business[]> {
  const { data, error } = await sb().from("businesses_view").select("*").order("id");
  if (error) raise(error);
  return (data ?? []).map(mapBusiness);
}

export async function setBusinessVisibility(id: number, isHidden: boolean): Promise<void> {
  const { error } = await sb().from("businesses").update({ is_hidden: isHidden }).eq("id", id);
  if (error) raise(error);
}

export async function adminDeleteBusiness(id: number): Promise<void> {
  const { error } = await sb().rpc("admin_delete_business", { business_id: id });
  if (error) raise(error);
}

export async function createCategory(name: string): Promise<Category> {
  const { data, error } = await sb().from("categories").insert({ name }).select().single();
  if (error) raise(error);
  return { id: data.id, name: data.name };
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await sb().from("categories").delete().eq("id", id);
  if (error) raise(error);
}

/**
 * Uploads through a signed URL, exactly as the app does, so both clients write
 * into the same bucket under the same RLS rules. The bucket caps files at 50 MB —
 * anything larger fails at the PUT, so it is checked before the round trip.
 */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function uploadFile(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 50 MB — please choose a smaller one.`,
    );
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { data: signed, error } = await sb().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) raise(error);

  const uploadUrl = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/upload/sign/${BUCKET}/${path}?token=${signed!.token}`;
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}). ${await res.text().catch(() => "")}`.trim());
  }

  return sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
