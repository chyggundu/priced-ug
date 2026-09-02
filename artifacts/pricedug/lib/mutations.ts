import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { type Business, type Product } from "@/lib/queries";

/*
  Writes go straight to PostgREST. RLS decides what is allowed, using the Clerk
  id in the JWT — nothing here re-checks ownership, because a client-side check
  would be advisory only.

  Reviews and customer lookup go through RPCs rather than table writes: the
  functions stamp the author from the JWT and enforce rules a row policy cannot
  express on its own.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapProductRow = (r: any): Product => ({
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

const mapBusinessRow = (r: any): Business => ({
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

/* ---------------------------------------------------------------- products */

export type ProductInput = {
  name: string;
  categoryId?: number | null;
  description?: string | null;
  price?: string | null;
  size?: string | null;
  materials?: string | null;
  imageUrl?: string | null;
};

/** Only keys the caller actually set are sent, so a partial edit never blanks a column. */
function productPayload(input: ProductInput): Record<string, unknown> {
  const src = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, column] of [
    ["name", "name"],
    ["categoryId", "category_id"],
    ["description", "description"],
    ["price", "price"],
    ["size", "size"],
    ["materials", "materials"],
    ["imageUrl", "image_url"],
  ] as const) {
    if (src[key] !== undefined) out[column] = src[key];
  }
  return out;
}

/** Every product of one business, for the owner's dashboard. */
export function useMyProducts(businessId: number | null | undefined) {
  return useQuery({
    queryKey: ["my-products", businessId ?? null],
    enabled: isSupabaseConfigured && businessId != null,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products_view")
        .select("*")
        .eq("business_id", businessId as number)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapProductRow);
    },
  });
}

/** Invalidates every list a product can appear in. */
function useProductInvalidation() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["products"] });
    void qc.invalidateQueries({ queryKey: ["my-products"] });
    void qc.invalidateQueries({ queryKey: ["business-products"] });
  };
}

export function useCreateProduct() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: async ({
      businessId,
      input,
    }: {
      businessId: number;
      input: ProductInput;
    }): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .insert({ ...productPayload(input), business_id: businessId })
        .select()
        .single();
      if (error) throw error;
      return mapProductRow(data);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: async ({
      productId,
      input,
    }: {
      productId: number;
      input: ProductInput;
    }): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .update(productPayload(input))
        .eq("id", productId)
        .select()
        .single();
      if (error) throw error;
      return mapProductRow(data);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: async (productId: number): Promise<void> => {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

/* -------------------------------------------------------------- businesses */

export type BusinessInput = {
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isHidden?: boolean;
};

function businessPayload(input: BusinessInput): Record<string, unknown> {
  const src = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, column] of [
    ["name", "name"],
    ["description", "description"],
    ["address", "address"],
    ["city", "city"],
    ["phone", "phone"],
    ["imageUrl", "image_url"],
    ["latitude", "latitude"],
    ["longitude", "longitude"],
    ["isHidden", "is_hidden"],
  ] as const) {
    if (src[key] !== undefined) out[column] = src[key];
  }
  return out;
}

function useBusinessInvalidation() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["my-business"] });
    void qc.invalidateQueries({ queryKey: ["business"] });
    void qc.invalidateQueries({ queryKey: ["admin-businesses"] });
  };
}

export function useCreateBusiness() {
  const invalidate = useBusinessInvalidation();
  return useMutation({
    mutationFn: async ({
      clerkUserId,
      input,
    }: {
      clerkUserId: string;
      input: BusinessInput;
    }): Promise<Business> => {
      const { data, error } = await supabase
        .from("businesses")
        .insert({ ...businessPayload(input), clerk_user_id: clerkUserId })
        .select()
        .single();
      if (error) throw error;
      return mapBusinessRow(data);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateMyBusiness() {
  const invalidate = useBusinessInvalidation();
  return useMutation({
    mutationFn: async ({
      businessId,
      input,
    }: {
      businessId: number;
      input: BusinessInput;
    }): Promise<Business> => {
      const { data, error } = await supabase
        .from("businesses")
        .update(businessPayload(input))
        .eq("id", businessId)
        .select()
        .single();
      if (error) throw error;
      return mapBusinessRow(data);
    },
    onSuccess: invalidate,
  });
}

/* ----------------------------------------------------------------- reviews */

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
  isMine: r.is_mine ?? false,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useReviews(businessId: number | null) {
  return useQuery({
    queryKey: ["reviews", businessId],
    enabled: isSupabaseConfigured && businessId != null,
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews_view")
        .select("*")
        .eq("business_id", businessId as number)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapReview);
    },
  });
}

function useReviewInvalidation(businessId: number | null) {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ["reviews", businessId] });
}

/** RPC, not an insert: it stamps the author from the JWT and enforces one per user. */
export function useCreateReview(businessId: number | null) {
  const invalidate = useReviewInvalidation(businessId);
  return useMutation({
    mutationFn: async (input: { rating: number; comment?: string | null }) => {
      const { data, error } = await supabase.rpc("create_review", {
        business_id: businessId,
        rating: input.rating,
        comment: input.comment ?? null,
      });
      if (error) throw error;
      return mapReview(data);
    },
    onSuccess: invalidate,
  });
}

export function useReplyToReview(businessId: number | null) {
  const invalidate = useReviewInvalidation(businessId);
  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      const { data, error } = await supabase.rpc("reply_to_review", {
        review_id: reviewId,
        reply,
      });
      if (error) throw error;
      return mapReview(data);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteReview(businessId: number | null) {
  const invalidate = useReviewInvalidation(businessId);
  return useMutation({
    mutationFn: async (reviewId: number): Promise<void> => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

/* --------------------------------------------------------------- customers */

export type Customer = {
  id: number;
  clerkUserId: string;
  fullName: string;
  phone: string;
  district: string;
  town: string | null;
  village: string | null;
  street: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapCustomer = (r: any): Customer => ({
  id: r.id,
  clerkUserId: r.clerk_user_id,
  fullName: r.full_name,
  phone: r.phone,
  district: r.district,
  town: r.town ?? null,
  village: r.village ?? null,
  street: r.street ?? null,
  latitude: r.latitude ?? null,
  longitude: r.longitude ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useMyCustomerProfile(clerkUserId: string | null | undefined) {
  return useQuery({
    queryKey: ["my-customer-profile", clerkUserId ?? null],
    enabled: isSupabaseConfigured && !!clerkUserId,
    retry: false,
    queryFn: async (): Promise<Customer | null> => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("clerk_user_id", clerkUserId as string)
        .maybeSingle();
      if (error) throw error;
      return data ? mapCustomer(data) : null;
    },
  });
}

export type CustomerInput = {
  fullName: string;
  phone: string;
  district: string;
  town?: string | null;
  village?: string | null;
  street?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function useSaveMyCustomerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clerkUserId,
      input,
    }: {
      clerkUserId: string;
      input: CustomerInput;
    }): Promise<Customer> => {
      const { data, error } = await supabase
        .from("customers")
        .upsert(
          {
            clerk_user_id: clerkUserId,
            full_name: input.fullName,
            phone: input.phone,
            district: input.district,
            town: input.town ?? null,
            village: input.village ?? null,
            street: input.street ?? null,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
          },
          { onConflict: "clerk_user_id" },
        )
        .select()
        .single();
      if (error) throw error;
      return mapCustomer(data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["my-customer-profile"] });
      void qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });
}

/** RPC: a business looks a customer up by phone + district to arrange delivery. */
export function useLookupCustomer() {
  return useMutation({
    mutationFn: async ({
      phone,
      district,
    }: {
      phone: string;
      district: string;
    }): Promise<Customer> => {
      const { data, error } = await supabase.rpc("lookup_customer", { phone, district });
      if (error) throw error;
      if (!data) throw new Error("Customer not found");
      return mapCustomer(data);
    },
  });
}

/* ------------------------------------------------------------------- admin */

export function useAdminBusinesses(enabled = true) {
  return useQuery({
    queryKey: ["admin-businesses"],
    // RLS would return an empty list to a non-admin anyway; skipping the
    // request avoids a pointless round trip on every screen mount.
    enabled: isSupabaseConfigured && enabled,
    queryFn: async (): Promise<Business[]> => {
      const { data, error } = await supabase
        .from("businesses_view")
        .select("*")
        .order("id");
      if (error) throw error;
      return (data ?? []).map(mapBusinessRow);
    },
  });
}

export function useAdminCustomers(enabled = true) {
  return useQuery({
    queryKey: ["admin-customers"],
    enabled: isSupabaseConfigured && enabled,
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from("customers_view")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapCustomer);
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: number): Promise<void> => {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

/** Admin-only; the row policy (and Supabase's `is_admin()`) is what enforces it. */
export function useSetBusinessVisibility() {
  const invalidate = useBusinessInvalidation();
  return useMutation({
    mutationFn: async ({
      businessId,
      isHidden,
    }: {
      businessId: number;
      isHidden: boolean;
    }): Promise<void> => {
      const { error } = await supabase
        .from("businesses")
        .update({ is_hidden: isHidden })
        .eq("id", businessId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

/** RPC, because deleting a business has to cascade through its products. */
export function useAdminDeleteBusiness() {
  const invalidate = useBusinessInvalidation();
  return useMutation({
    mutationFn: async (businessId: number): Promise<void> => {
      const { error } = await supabase.rpc("admin_delete_business", {
        business_id: businessId,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
