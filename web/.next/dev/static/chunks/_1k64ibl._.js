(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_UPLOAD_BYTES",
    ()=>MAX_UPLOAD_BYTES,
    "addFavorite",
    ()=>addFavorite,
    "adminDeleteBusiness",
    ()=>adminDeleteBusiness,
    "createBusiness",
    ()=>createBusiness,
    "createCategory",
    ()=>createCategory,
    "createProduct",
    ()=>createProduct,
    "createReview",
    ()=>createReview,
    "deleteCategory",
    ()=>deleteCategory,
    "deleteMyAccountData",
    ()=>deleteMyAccountData,
    "deleteProduct",
    ()=>deleteProduct,
    "deleteReview",
    ()=>deleteReview,
    "getAdminBusinesses",
    ()=>getAdminBusinesses,
    "getAdminCustomers",
    ()=>getAdminCustomers,
    "getBusiness",
    ()=>getBusiness,
    "getBusinessProducts",
    ()=>getBusinessProducts,
    "getBusinessReviews",
    ()=>getBusinessReviews,
    "getBusinesses",
    ()=>getBusinesses,
    "getCategories",
    ()=>getCategories,
    "getFavorites",
    ()=>getFavorites,
    "getMyBusiness",
    ()=>getMyBusiness,
    "getMyCustomerProfile",
    ()=>getMyCustomerProfile,
    "getMyProducts",
    ()=>getMyProducts,
    "getProduct",
    ()=>getProduct,
    "lookupCustomer",
    ()=>lookupCustomer,
    "removeFavorite",
    ()=>removeFavorite,
    "replyToReview",
    ()=>replyToReview,
    "saveMyCustomerProfile",
    ()=>saveMyCustomerProfile,
    "searchProducts",
    ()=>searchProducts,
    "setBusinessVisibility",
    ()=>setBusinessVisibility,
    "updateMyBusiness",
    ()=>updateMyBusiness,
    "updateProduct",
    ()=>updateProduct,
    "uploadFile",
    ()=>uploadFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
/* eslint-disable @typescript-eslint/no-explicit-any */ const mapBusiness = (r)=>({
        id: r.id,
        clerkUserId: r.clerk_user_id,
        name: r.name,
        description: r.description ?? null,
        address: r.address ?? null,
        city: r.city ?? null,
        phone: r.phone ?? null,
        categories: r.categories ?? [],
        imageUrl: r.image_url ?? null,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
        openingTime: r.opening_time ?? null,
        closingTime: r.closing_time ?? null,
        isHidden: r.is_hidden ?? false,
        createdAt: r.created_at
    });
const mapProduct = (r)=>({
        id: r.id,
        businessId: r.business_id,
        categoryId: r.category_id ?? null,
        categoryName: r.category_name ?? null,
        name: r.name,
        description: r.description ?? null,
        price: r.price ?? null,
        priceType: r.price_type ?? null,
        imageUrl: r.image_url ?? null,
        imageUrls: r.image_urls ?? [],
        videoUrl: r.video_url ?? null,
        size: r.size ?? null,
        materials: r.materials ?? null,
        color: r.color ?? null,
        condition: r.condition ?? null,
        deliveredByPricedUg: r.delivered_by_priced_ug ?? false,
        deliveredByBusiness: r.delivered_by_business ?? false,
        createdAt: r.created_at
    });
/* eslint-enable @typescript-eslint/no-explicit-any */ function raise(error) {
    throw new Error(error.message);
}
function requireUserId() {
    const uid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUserId"])();
    if (!uid) throw new Error("Not signed in");
    return uid;
}
async function getCategories() {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("categories").select("*").order("name");
    if (error) raise(error);
    return (data ?? []).map((r)=>({
            id: r.id,
            name: r.name
        }));
}
/* eslint-disable @typescript-eslint/no-explicit-any */ const mapProductSearch = (r)=>({
        ...mapProduct(r),
        businessName: r.business_name,
        businessImageUrl: r.business_image_url ?? null,
        businessCity: r.business_city ?? null
    });
async function getBusinesses(search) {
    let query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses_view").select("*").eq("is_hidden", false);
    if (search) {
        const pattern = `%${search}%`;
        query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`);
    }
    const { data, error } = await query.order("id");
    if (error) raise(error);
    return (data ?? []).map(mapBusiness);
}
async function getBusiness(id) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses_view").select("*").eq("id", id).maybeSingle();
    if (error) raise(error);
    if (!data) throw new Error("Business not found");
    return mapBusiness(data);
}
async function getBusinessProducts(businessId) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products_view").select("*").eq("business_id", businessId).order("created_at", {
        ascending: true
    });
    if (error) raise(error);
    return (data ?? []).map(mapProduct);
}
async function searchProducts(params) {
    let query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products_search_view").select("*");
    if (params.categoryId != null) query = query.eq("category_id", params.categoryId);
    if (params.q) {
        const pattern = `%${params.q}%`;
        query = query.or(`name.ilike.${pattern},description.ilike.${pattern},size.ilike.${pattern},materials.ilike.${pattern}`);
    }
    const { data, error } = await query.order("created_at", {
        ascending: false
    });
    if (error) raise(error);
    return (data ?? []).map(mapProductSearch);
}
async function getProduct(productId) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products_view").select("*").eq("id", productId).maybeSingle();
    if (error) raise(error);
    if (!data) throw new Error("Item not found");
    return mapProduct(data);
}
async function getFavorites() {
    const { data: rows, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("favorites").select("business_id, product_id");
    if (error) raise(error);
    const businessIds = (rows ?? []).map((r)=>r.business_id).filter((v)=>v != null);
    const productIds = (rows ?? []).map((r)=>r.product_id).filter((v)=>v != null);
    const [businesses, products] = await Promise.all([
        businessIds.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses_view").select("*").in("id", businessIds).then(({ data, error: e })=>{
            if (e) raise(e);
            return (data ?? []).map(mapBusiness);
        }) : Promise.resolve([]),
        productIds.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products_search_view").select("*").in("id", productIds).then(({ data, error: e })=>{
            if (e) raise(e);
            return (data ?? []).map(mapProduct);
        }) : Promise.resolve([])
    ]);
    return {
        businesses,
        products
    };
}
async function addFavorite(target) {
    const uid = requireUserId();
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("favorites").insert({
        clerk_user_id: uid,
        business_id: target.businessId ?? null,
        product_id: target.productId ?? null
    });
    // 23505 = already favourited, which is the desired end state anyway.
    if (error && error.code !== "23505") raise(error);
}
async function removeFavorite(target) {
    const uid = requireUserId();
    let query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("favorites").delete().eq("clerk_user_id", uid);
    query = target.businessId != null ? query.eq("business_id", target.businessId) : query.eq("product_id", target.productId);
    const { error } = await query;
    if (error) raise(error);
}
async function getMyBusiness() {
    const uid = requireUserId();
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses_view").select("*").eq("clerk_user_id", uid).maybeSingle();
    if (error) raise(error);
    return data ? mapBusiness(data) : null;
}
function businessPayload(input) {
    const src = input;
    const out = {};
    for (const [key, column] of [
        [
            "name",
            "name"
        ],
        [
            "description",
            "description"
        ],
        [
            "address",
            "address"
        ],
        [
            "city",
            "city"
        ],
        [
            "phone",
            "phone"
        ],
        [
            "imageUrl",
            "image_url"
        ],
        [
            "openingTime",
            "opening_time"
        ],
        [
            "closingTime",
            "closing_time"
        ]
    ]){
        if (src[key] !== undefined) out[column] = src[key];
    }
    return out;
}
async function createBusiness(input) {
    const uid = requireUserId();
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses").insert({
        ...businessPayload(input),
        clerk_user_id: uid
    }).select().single();
    if (error) raise(error);
    return mapBusiness(data);
}
async function updateMyBusiness(id, input) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses").update(businessPayload(input)).eq("id", id).select().single();
    if (error) raise(error);
    return mapBusiness(data);
}
async function getMyProducts(businessId) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products_view").select("*").eq("business_id", businessId).order("created_at", {
        ascending: true
    });
    if (error) raise(error);
    return (data ?? []).map(mapProduct);
}
function productPayload(input) {
    const src = input;
    const out = {};
    for (const [key, column] of [
        [
            "name",
            "name"
        ],
        [
            "categoryId",
            "category_id"
        ],
        [
            "description",
            "description"
        ],
        [
            "price",
            "price"
        ],
        [
            "priceType",
            "price_type"
        ],
        [
            "imageUrl",
            "image_url"
        ],
        [
            "imageUrls",
            "image_urls"
        ],
        [
            "videoUrl",
            "video_url"
        ],
        [
            "size",
            "size"
        ],
        [
            "materials",
            "materials"
        ],
        [
            "color",
            "color"
        ],
        [
            "condition",
            "condition"
        ],
        [
            "deliveredByPricedUg",
            "delivered_by_priced_ug"
        ],
        [
            "deliveredByBusiness",
            "delivered_by_business"
        ]
    ]){
        if (src[key] !== undefined) out[column] = src[key];
    }
    return out;
}
async function createProduct(businessId, input) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products").insert({
        ...productPayload(input),
        business_id: businessId
    }).select().single();
    if (error) raise(error);
    return mapProduct(data);
}
async function updateProduct(productId, input) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products").update(productPayload(input)).eq("id", productId).select().single();
    if (error) raise(error);
    return mapProduct(data);
}
async function deleteProduct(productId) {
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("products").delete().eq("id", productId);
    if (error) raise(error);
}
/* eslint-disable @typescript-eslint/no-explicit-any */ const mapReview = (r)=>({
        id: r.id,
        businessId: r.business_id,
        authorName: r.author_name,
        rating: r.rating,
        comment: r.comment ?? null,
        reply: r.reply ?? null,
        repliedAt: r.replied_at ?? null,
        createdAt: r.created_at,
        isMine: !!r.is_mine
    });
async function getBusinessReviews(businessId) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("reviews_view").select("*").eq("business_id", businessId).order("created_at", {
        ascending: false
    });
    if (error) raise(error);
    return (data ?? []).map(mapReview);
}
async function createReview(businessId, input) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().rpc("create_review", {
        business_id: businessId,
        rating: input.rating,
        comment: input.comment ?? null
    });
    if (error) raise(error);
    return mapReview(data);
}
async function replyToReview(reviewId, reply) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().rpc("reply_to_review", {
        review_id: reviewId,
        reply
    });
    if (error) raise(error);
    return mapReview(data);
}
async function deleteReview(reviewId) {
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("reviews").delete().eq("id", reviewId);
    if (error) raise(error);
}
/* eslint-disable @typescript-eslint/no-explicit-any */ const mapCustomer = (r)=>({
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
        updatedAt: r.updated_at
    });
async function getMyCustomerProfile() {
    const uid = requireUserId();
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("customers").select("*").eq("clerk_user_id", uid).maybeSingle();
    if (error) raise(error);
    return data ? mapCustomer(data) : null;
}
async function saveMyCustomerProfile(input) {
    const uid = requireUserId();
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("customers").upsert({
        clerk_user_id: uid,
        full_name: input.fullName,
        phone: input.phone,
        district: input.district,
        town: input.town ?? null,
        village: input.village ?? null,
        street: input.street ?? null,
        address_photo_url: input.addressPhotoUrl ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null
    }, {
        onConflict: "clerk_user_id"
    }).select().single();
    if (error) raise(error);
    return mapCustomer(data);
}
async function lookupCustomer(phone, district) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().rpc("lookup_customer", {
        phone,
        district
    });
    if (error) raise(error);
    if (!data) throw new Error("Customer not found");
    return mapCustomer(data);
}
async function getAdminCustomers() {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("customers_view").select("*").order("created_at", {
        ascending: false
    });
    if (error) raise(error);
    return (data ?? []).map(mapCustomer);
}
async function deleteMyAccountData() {
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().rpc("delete_my_account");
    if (error) raise(error);
}
async function getAdminBusinesses() {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses_view").select("*").order("id");
    if (error) raise(error);
    return (data ?? []).map(mapBusiness);
}
async function setBusinessVisibility(id, isHidden) {
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("businesses").update({
        is_hidden: isHidden
    }).eq("id", id);
    if (error) raise(error);
}
async function adminDeleteBusiness(id) {
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().rpc("admin_delete_business", {
        business_id: id
    });
    if (error) raise(error);
}
async function createCategory(name) {
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("categories").insert({
        name
    }).select().single();
    if (error) raise(error);
    return {
        id: data.id,
        name: data.name
    };
}
async function deleteCategory(id) {
    const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().from("categories").delete().eq("id", id);
    if (error) raise(error);
}
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
async function uploadFile(file) {
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 50 MB — please choose a smaller one.`);
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { data: signed, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().storage.from(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUCKET"]).createSignedUploadUrl(path);
    if (error) raise(error);
    const uploadUrl = `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseUrl"].replace(/\/+$/, "")}/storage/v1/object/upload/sign/${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUCKET"]}/${path}?token=${signed.token}`;
    const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type || "application/octet-stream"
        },
        body: file
    });
    if (!res.ok) {
        throw new Error(`Upload failed (${res.status}). ${await res.text().catch(()=>"")}`.trim());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sb"])().storage.from(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUCKET"]).getPublicUrl(path).data.publicUrl;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/admin.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Admin is decided by verified email, matching the mobile app's AuthContext and
 * the Supabase `is_admin()` function. A Clerk user id would not survive an
 * instance switch (dev and production issue different ids), an email does.
 *
 * The parameter is typed structurally rather than as Clerk's UserResource:
 * @clerk/types is a transitive dependency, and this only needs the email list.
 */ __turbopack_context__.s([
    "isAdminUser",
    ()=>isAdminUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const ADMIN_EMAIL = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_ADMIN_EMAIL ?? "priceduganda@gmail.com").toLowerCase();
function isAdminUser(user) {
    if (!user) return false;
    return user.emailAddresses.some((email)=>email.emailAddress.toLowerCase() === ADMIN_EMAIL && email.verification?.status === "verified");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/content/site.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Single source of truth for every piece of copy and every outbound link on the
 * site. Edit this file to change the website — the page components read from it
 * and should not need touching.
 */ __turbopack_context__.s([
    "audiences",
    ()=>audiences,
    "brand",
    ()=>brand,
    "features",
    ()=>features,
    "links",
    ()=>links,
    "screenshots",
    ()=>screenshots,
    "site",
    ()=>site,
    "team",
    ()=>team
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const site = {
    name: "Priced Ug",
    tagline: "Uganda's local business directory & marketplace",
    description: "Browse Ugandan businesses by category, see every product with its real price in UGX, and call the owner in one tap. Free to browse — no sign-in needed.",
    url: ("TURBOPACK compile-time value", "https://pricedug.com") ?? "https://pricedug.com"
};
const links = {
    appStore: "",
    playStore: "https://play.google.com/store/apps/details?id=com.pricedug.mobile",
    /** Taken from the Contact section of the published privacy policy. */ email: "priceduganda@gmail.com",
    whatsapp: "256787298866",
    phone: ""
};
const brand = {
    /** Matches the mobile app's palette (artifacts/pricedug/constants/colors.ts). */ primary: "#E01E37"
};
const audiences = [
    {
        id: "public",
        title: "For everyone",
        badge: "No sign-in needed",
        summary: "Anyone can open the app and start browsing straight away. No account, no barrier.",
        points: [
            {
                title: "Browse businesses",
                body: "A grid of business pages you can filter by category — food, clothing, electronics and more — or search by name."
            },
            {
                title: "View a business page",
                body: "Banner photo, description, address and a full product list. Every product shows its photo, price in UGX, size and materials."
            },
            {
                title: "Contact instantly",
                body: "Call buttons are everywhere, so you can reach a business or place an order in a single tap."
            },
            {
                title: "Read reviews",
                body: "See ratings and comments left by other customers before you buy."
            }
        ]
    },
    {
        id: "owners",
        title: "For business owners",
        badge: "Sign in required",
        summary: "Your shop, your page. Everything you need to get found and take orders.",
        points: [
            {
                title: "Create your business page",
                body: "Every owner gets exactly one page that they fully control, from banner to address."
            },
            {
                title: "Manage products",
                body: "Add, edit and delete products with photos, prices, descriptions, sizes and materials."
            },
            {
                title: "Reply to reviews",
                body: "Respond once to each customer review, so buyers hear your side too."
            },
            {
                title: "Look up customers for delivery",
                body: "Enter a customer's number and district to pull up their saved delivery details — address, a map pin, and the address photo of the house, gate or landmark. Message them, or share and copy the location."
            }
        ]
    },
    {
        id: "customers",
        title: "For customers",
        badge: "Sign-in optional",
        summary: "Set your delivery details once, and every business you order from already knows how to find you.",
        points: [
            {
                title: "Save a delivery profile",
                body: "Name, phone, district, street, a map location and an address photo — stored once, ready for every order."
            },
            {
                title: "Be found first time",
                body: "When you order, the business already has everything it needs to reach your door. No long directions over the phone."
            },
            {
                title: "Leave reviews",
                body: "One review per business, with a 1–5 star rating and an optional comment."
            }
        ]
    }
];
const features = [
    {
        title: "Real prices in UGX",
        body: "Every product lists its actual price. No guessing, no asking, no back-and-forth before you know what something costs."
    },
    {
        title: "Filter by category",
        body: "Food, clothing, electronics, beddings, boda boda parts, bookshops and more — narrow the grid to what you actually need."
    },
    {
        title: "Search by name",
        body: "Know the shop already? Type the name and go straight to its page."
    },
    {
        title: "One-tap contact",
        body: "Call buttons throughout the app connect you to the business immediately."
    },
    {
        title: "Ratings & reviews",
        body: "Honest 1–5 star reviews from real customers, with owner replies for balance."
    },
    {
        title: "Delivery made simple",
        body: "Saved delivery profiles carry a map pin and an address photo, so drivers find the right gate the first time."
    }
];
const screenshots = [
    {
        src: "/screenshots/browse.png",
        alt: "Browsing local products and prices in the Priced Ug app",
        caption: "Browse and filter every listing by category, location and price."
    },
    {
        src: "/screenshots/business.png",
        alt: "A Priced Ug business page showing products with prices",
        caption: "Each business page carries its full product list and a call button."
    },
    {
        src: "/screenshots/account.png",
        alt: "The Priced Ug account screen",
        caption: "Manage your account, delivery profile and business page."
    },
    {
        src: "/screenshots/signin.png",
        alt: "Signing in to Priced Ug",
        caption: "Sign in only when you want to sell, review or save a delivery profile."
    }
];
const team = [
    {
        name: "Tomasi Kiggundu",
        role: "Chief Executive Officer",
        photo: "/team/tomasi-kiggundu.jpg",
        lead: "A logistics and operations professional with an international background spanning Europe, Africa and the United States.",
        bio: [
            "Tomasi studied Logistics at Nova College in Haarlem, North Holland, where he built a strong foundation in supply chain management, operations and business logistics.",
            "Throughout his career he has gained hands-on experience in logistics coordination, operations management, media and entrepreneurship. He previously worked with GTV Uganda, and later served as a Junior Operations Manager (Logistics) at International Bike Group in Amsterdam, where he supported day-to-day operational planning and logistics processes. He also worked as a Logistical Clerk at AP Logistics in Amsterdam Sloterdijk, managing inventory, shipment coordination and warehouse operations.",
            "Today he is co-owner of East African Tacos in Los Angeles, where he combines operational expertise with a passion for business, customer service, and bringing authentic East African flavours to the community.",
            "His diverse international experience has strengthened his ability to adapt, solve complex operational challenges, and build businesses that prioritise efficiency, innovation and customer satisfaction. He is passionate about entrepreneurship, logistics, and creating opportunities that connect people, businesses and communities across borders."
        ],
        skills: [
            "Supply chain management",
            "Operations management",
            "Logistics coordination",
            "Inventory & warehouse operations",
            "Entrepreneurship",
            "Customer service"
        ],
        education: [
            {
                school: "Nova College, Haarlem",
                detail: "Logistics — North Holland, Netherlands"
            }
        ]
    },
    {
        // Written from Resty's own LinkedIn profile. Skills are only the ones she
        // actually lists there — six more are hidden behind LinkedIn's "+6 skills",
        // so they are deliberately not guessed at. Degree classifications are on her
        // profile but omitted here; add them if she wants them shown.
        name: "Resty Babirye",
        role: "Business Development Manager",
        photo: "/team/resty-babirye.jpg",
        credentials: "MBA-IB, BA (SS), Dip-Ed",
        linkedin: "https://www.linkedin.com/in/resty-babirye-mba-ib-ba-ss-dip-ed-b0a385211",
        lead: "A results-driven sales and business development professional with over 10 years' experience in Pay-TV sales, the consumer sector and telecommunications.",
        bio: [
            "Resty has a proven ability to execute market growth strategies, build and manage cross-functional high-performing teams, strengthen client relationships, and drive consistent sales results through structured coaching, delegation, quality compliance oversight and data-driven decision-making. She streamlines processes and delivers projects on time and within budget.",
            "Since April 2018 she has been Territory Sales Manager at MultiChoice Group in Uganda, covering territory development and customer service management across her patch. Before that she spent three years as Retail Sales Manager at GOtv Uganda, from 2015 to 2018, growing the retail channel.",
            "Based in Kampala, she leads business development at Priced Ug — bringing Ugandan businesses onto the platform and helping them get the most out of it."
        ],
        skills: [
            "Territory development",
            "Customer service management",
            "Business-to-Business (B2B)",
            "People management"
        ],
        education: [
            {
                school: "Amity University",
                detail: "Master of Business Administration (MBA) — International Business, 2014–2016"
            },
            {
                school: "Makerere University",
                detail: "Bachelor of Arts (BA) — Social Sciences, 2010–2014"
            },
            {
                school: "Kyambogo University",
                detail: "Diploma of Education — Secondary Education and Teaching"
            }
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AuthButtons.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthButtons",
    ()=>AuthButtons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/hooks-74kNS3WZ.mjs [app-client] (ecmascript) <locals> <export b as useAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+shared@4.29.1_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useClerk as s> <export s as useClerk>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+shared@4.29.1_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useUser as h> <export h as useUser>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/clerk.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function AuthButtons() {
    // No Clerk key in this build: still offer the buttons (the pages explain the
    // situation) rather than calling hooks that would throw without a provider.
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClerkConfigured"]) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SignedOutButtons, {}, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 19,
        columnNumber: 34
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthButtonsLive, {}, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
_c = AuthButtons;
function AuthButtonsLive() {
    _s();
    const { isLoaded, isSignedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__["useUser"])();
    const { signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__["useClerk"])();
    if (!isLoaded) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-9 w-[8.5rem]",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 28,
        columnNumber: 25
    }, this);
    if (isSignedIn) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/my-business",
                    className: "hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500 sm:block",
                    children: "My business"
                }, void 0, false, {
                    fileName: "[project]/components/AuthButtons.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/account",
                    title: user?.primaryEmailAddress?.emailAddress ?? undefined,
                    className: "rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500",
                    children: "Account"
                }, void 0, false, {
                    fileName: "[project]/components/AuthButtons.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>signOut({
                            redirectUrl: "/"
                        }),
                    className: "rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:border-brand-500 hover:text-brand-500",
                    children: "Sign out"
                }, void 0, false, {
                    fileName: "[project]/components/AuthButtons.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/AuthButtons.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SignedOutButtons, {}, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 57,
        columnNumber: 10
    }, this);
}
_s(AuthButtonsLive, "Sd+aCZlsRKXNn8nQNj23O6rQ3n4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__["useClerk"]
    ];
});
_c1 = AuthButtonsLive;
function SignedOutButtons() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/sign-in",
                className: "rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500",
                children: "Login"
            }, void 0, false, {
                fileName: "[project]/components/AuthButtons.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/sign-up",
                className: "rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                children: "Sign up"
            }, void 0, false, {
                fileName: "[project]/components/AuthButtons.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_c2 = SignedOutButtons;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "AuthButtons");
__turbopack_context__.k.register(_c1, "AuthButtonsLive");
__turbopack_context__.k.register(_c2, "SignedOutButtons");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Nav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Nav",
    ()=>Nav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/content/site.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthButtons.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const NAV_LINKS = [
    {
        href: "/browse",
        label: "Browse"
    },
    {
        href: "/#how-it-works",
        label: "How it works"
    },
    {
        href: "/#features",
        label: "Features"
    },
    {
        href: "/#contact",
        label: "Contact"
    },
    {
        href: "/#download",
        label: "Get the app"
    }
];
function Nav() {
    _s();
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Lift the bar off the page once scrolling starts. Initial state matches the
    // server render (false), so there is no hydration mismatch.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Nav.useEffect": ()=>{
            const onScroll = {
                "Nav.useEffect.onScroll": ()=>setScrolled(window.scrollY > 8)
            }["Nav.useEffect.onScroll"];
            onScroll();
            window.addEventListener("scroll", onScroll, {
                passive: true
            });
            return ({
                "Nav.useEffect": ()=>window.removeEventListener("scroll", onScroll)
            })["Nav.useEffect"];
        }
    }["Nav.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: `sticky top-0 z-50 backdrop-blur-md transition duration-300 ${scrolled ? "border-b border-line/80 bg-white/85 shadow-sm shadow-black/5" : "border-b border-transparent bg-white/60"}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            "aria-label": "Main",
            className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "group flex items-center gap-2.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: "/logo.svg",
                            alt: "",
                            width: 32,
                            height: 32,
                            className: "size-8 transition duration-300 group-hover:-rotate-12 group-hover:scale-110",
                            priority: true
                        }, void 0, false, {
                            fileName: "[project]/components/Nav.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-lg font-bold tracking-tight",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["site"].name
                        }, void 0, false, {
                            fileName: "[project]/components/Nav.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Nav.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "hidden items-center gap-5 md:flex lg:gap-7",
                    children: NAV_LINKS.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: link.href,
                                className: "relative text-sm font-medium text-ink-600 transition after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-[width] after:duration-300 hover:text-brand-500 hover:after:w-full",
                                children: link.label
                            }, void 0, false, {
                                fileName: "[project]/components/Nav.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this)
                        }, link.href, false, {
                            fileName: "[project]/components/Nav.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/Nav.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthButtons"], {}, void 0, false, {
                    fileName: "[project]/components/Nav.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Nav.tsx",
            lineNumber: 37,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Nav.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_s(Nav, "tQtW9FyKD+Ut/6k+f0BCbABprL4=");
_c = Nav;
var _c;
__turbopack_context__.k.register(_c, "Nav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/content/legal.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * The app's user agreement, copied verbatim from the mobile app's
 * constants/legalAgreement.ts. Duplicated on purpose: the website shares no
 * files with the monorepo, so this is the site's own copy. Keep both in step
 * whenever the agreement changes.
 */ __turbopack_context__.s([
    "LEGAL_ACCEPTED_STORAGE_KEY",
    ()=>LEGAL_ACCEPTED_STORAGE_KEY,
    "LEGAL_AGREEMENT_EFFECTIVE_DATE",
    ()=>LEGAL_AGREEMENT_EFFECTIVE_DATE,
    "LEGAL_AGREEMENT_INTRO",
    ()=>LEGAL_AGREEMENT_INTRO,
    "LEGAL_AGREEMENT_SECTIONS",
    ()=>LEGAL_AGREEMENT_SECTIONS,
    "LEGAL_AGREEMENT_TITLE",
    ()=>LEGAL_AGREEMENT_TITLE,
    "LEGAL_AGREEMENT_VERSION",
    ()=>LEGAL_AGREEMENT_VERSION
]);
const LEGAL_AGREEMENT_VERSION = "1.0";
const LEGAL_AGREEMENT_EFFECTIVE_DATE = "June 2026";
const LEGAL_ACCEPTED_STORAGE_KEY = "pricedug_legal_accepted_version";
const LEGAL_AGREEMENT_TITLE = "User Agreement, Liability Waiver & Dispute Resolution";
const LEGAL_AGREEMENT_INTRO = `Effective ${LEGAL_AGREEMENT_EFFECTIVE_DATE} · Version ${LEGAL_AGREEMENT_VERSION}\n\n` + `Please read this Agreement carefully. By ticking the box and continuing, you confirm that you ` + `have read, understood, and agree to be legally bound by every part of it, including the ` + `Liability Waiver, the Binding Arbitration clause, and the Class Action Waiver. If you do not ` + `agree, do not use the Priced Ug application ("the App").`;
const LEGAL_AGREEMENT_SECTIONS = [
    {
        heading: "1. Acceptance & Consent",
        body: "By downloading, accessing, or using the App, you (\"User\", \"you\") enter into a binding legal " + "agreement with the owner and operator of the App (\"Owner\", \"we\", \"us\"). You consent to the " + "collection and use of your information as described in our Privacy Policy, and you agree to these " + "terms on behalf of yourself and, where applicable, any business or person you represent. You confirm " + "you are at least 18 years old and legally able to enter into this Agreement."
    },
    {
        heading: "2. Nature of the Service",
        body: "The App is a directory and marketplace platform that lets businesses list products and lets the public " + "browse and contact those businesses. The Owner is NOT a party to any transaction, sale, or " + "communication between users and businesses. The Owner does not manufacture, sell, inspect, or " + "guarantee any product, price, or service listed. Any dealing you have with a business is solely between " + "you and that business, at your own risk."
    },
    {
        heading: "3. Assumption of Risk",
        body: "You understand and voluntarily accept all risks arising from your use of the App and from any interaction, " + "purchase, payment, or meeting involving a business or other user. This includes, without " + "limitation, the risk of inaccurate listings, defective or unsafe products, fraud, financial " + "loss, personal injury, or property damage. You use the App and deal with businesses entirely at your own risk."
    },
    {
        heading: "4. Release & Liability Waiver",
        body: "To the fullest extent permitted by law, you hereby RELEASE, WAIVE, and forever discharge the Owner and its " + "operators, employees, and agents from any and all claims, demands, damages, losses, liabilities, costs, and " + "expenses of every kind — whether known or unknown, direct or indirect — arising out of or connected with your " + "use of the App or any dealing with a business or user through the App. You agree not to hold the Owner " + "responsible for the acts, omissions, products, or conduct of any business or user."
    },
    {
        heading: "5. Disclaimer of Warranties",
        body: "The App is provided \"AS IS\" and \"AS AVAILABLE\" without warranties of any kind, express or implied, " + "including any warranty of merchantability, fitness for a particular purpose, accuracy, or non-infringement. " + "We do not warrant that the App will be uninterrupted, error-free, secure, or that any listing is accurate, " + "current, or lawful."
    },
    {
        heading: "6. Limitation of Liability",
        body: "To the maximum extent permitted by law, the Owner's total liability to you for any and all claims relating to " + "the App shall not exceed the greater of the amount you paid to the Owner (if any) in the 12 months before the " + "claim, or UGX 100,000. In no event shall the Owner be liable for any indirect, incidental, special, " + "consequential, punitive, or exemplary damages, or for lost profits, data, or goodwill."
    },
    {
        heading: "7. Indemnification",
        body: "You agree to defend, indemnify, and hold harmless the Owner from any claim, liability, loss, or expense " + "(including reasonable legal fees) arising from your use of the App, your violation of this Agreement, or your " + "dealings with any business or user."
    },
    {
        heading: "8. Binding Individual Arbitration",
        body: "You and the Owner agree that any dispute, claim, or controversy arising out of or relating to this Agreement " + "or the App shall be resolved exclusively by final and binding arbitration on an INDIVIDUAL basis, and NOT in a " + "court of law, except that either party may bring a qualifying claim in a small-claims forum. The arbitration " + "shall be conducted in Uganda, in English, under applicable arbitration rules. You understand that by agreeing " + "to arbitration, you are giving up your right to go to court and your right to a trial by judge or jury."
    },
    {
        heading: "9. Class Action & Jury Trial Waiver",
        body: "To the fullest extent permitted by law, you and the Owner agree that each may bring claims against the other " + "ONLY in an individual capacity, and NOT as a plaintiff or class member in any purported class, collective, " + "consolidated, or representative action. You expressly WAIVE any right to participate in a class action or " + "class-wide arbitration and WAIVE any right to a trial by jury. No arbitrator or court may consolidate more " + "than one person's claims or preside over any form of representative or class proceeding."
    },
    {
        heading: "10. Governing Law & Venue",
        body: "This Agreement is governed by the laws of the Republic of Uganda, without regard to conflict-of-law rules. " + "Subject to the arbitration clause above, the courts and tribunals of Uganda shall have jurisdiction over any " + "matter not subject to arbitration."
    },
    {
        heading: "11. Severability & Entire Agreement",
        body: "If any provision of this Agreement is found unenforceable, that provision shall be limited or removed to the " + "minimum extent necessary, and the remaining provisions shall stay in full force. If the Class Action Waiver is " + "found unenforceable for a particular claim, that claim shall proceed in court, but all other claims remain in " + "arbitration. This Agreement, together with the Privacy Policy, is the entire agreement between you and the Owner."
    },
    {
        heading: "12. Changes & Contact",
        body: "We may update this Agreement from time to time. Continued use of the App after an update, or accepting a new " + "version when prompted, means you accept the changes. For questions about this Agreement, contact the Owner " + "through the support options in the App."
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ConsentGate.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConsentGate",
    ()=>ConsentGate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Nav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$legal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/content/legal.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ConsentGate({ children }) {
    _s();
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("loading");
    const [checked, setChecked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConsentGate.useEffect": ()=>{
            try {
                const accepted = window.localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$legal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEGAL_ACCEPTED_STORAGE_KEY"]);
                setStatus(accepted === __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$legal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEGAL_AGREEMENT_VERSION"] ? "accepted" : "needed");
            } catch  {
                // Storage blocked (private mode, strict settings) — ask again rather than
                // locking the user out of their own account.
                setStatus("needed");
            }
        }
    }["ConsentGate.useEffect"], []);
    const accept = ()=>{
        try {
            window.localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$legal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEGAL_ACCEPTED_STORAGE_KEY"], __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$legal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEGAL_AGREEMENT_VERSION"]);
        } catch  {
        // Not persisting is survivable; the gate simply asks again next visit.
        }
        setStatus("accepted");
    };
    if (status === "loading") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Nav"], {}, void 0, false, {
                    fileName: "[project]/components/ConsentGate.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "mx-auto w-full max-w-3xl px-5 py-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-40 animate-pulse rounded-[10px] bg-ink-900/5"
                    }, void 0, false, {
                        fileName: "[project]/components/ConsentGate.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ConsentGate.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    if (status === "needed") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Nav"], {}, void 0, false, {
                    fileName: "[project]/components/ConsentGate.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "mx-auto w-full max-w-3xl px-5 py-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-[10px] border border-line p-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-bold tracking-tight",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$legal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEGAL_AGREEMENT_TITLE"]
                            }, void 0, false, {
                                fileName: "[project]/components/ConsentGate.tsx",
                                lineNumber: 62,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-ink-600",
                                children: "Before using your account, please read and accept the agreement. It covers the liability waiver, binding arbitration, and class action waiver."
                            }, void 0, false, {
                                fileName: "[project]/components/ConsentGate.tsx",
                                lineNumber: 63,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/legal",
                                className: "mt-3 inline-block text-sm font-medium text-brand-500 transition hover:text-brand-600",
                                children: "Read the full agreement →"
                            }, void 0, false, {
                                fileName: "[project]/components/ConsentGate.tsx",
                                lineNumber: 68,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "mt-5 flex items-start gap-2.5 text-[15px] text-ink-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: checked,
                                        onChange: (e)=>setChecked(e.target.checked),
                                        className: "mt-0.5 size-4 accent-brand-500"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ConsentGate.tsx",
                                        lineNumber: 76,
                                        columnNumber: 11
                                    }, this),
                                    "I have read and agree to be legally bound by the User Agreement, Liability Waiver and Dispute Resolution terms."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ConsentGate.tsx",
                                lineNumber: 75,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: accept,
                                disabled: !checked,
                                className: "mt-5 rounded-[10px] bg-brand-500 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
                                children: "Agree and continue"
                            }, void 0, false, {
                                fileName: "[project]/components/ConsentGate.tsx",
                                lineNumber: 86,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ConsentGate.tsx",
                        lineNumber: 61,
                        columnNumber: 7
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ConsentGate.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(ConsentGate, "WJzxGMG4wpkYhUoXV8hQBJRxBrs=");
_c = ConsentGate;
var _c;
__turbopack_context__.k.register(_c, "ConsentGate");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/DashboardShell.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardShell",
    ()=>DashboardShell,
    "Notice",
    ()=>Notice,
    "RequireSignIn",
    ()=>RequireSignIn,
    "ghostButton",
    ()=>ghostButton,
    "input",
    ()=>input,
    "label",
    ()=>label,
    "primaryButton",
    ()=>primaryButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/hooks-74kNS3WZ.mjs [app-client] (ecmascript) <locals> <export b as useAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Nav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConsentGate$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ConsentGate.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/clerk.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const label = "block text-sm font-semibold text-ink-900";
const input = "mt-1.5 w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const primaryButton = "rounded-[10px] bg-brand-500 px-5 py-3 text-[15px] font-semibold text-white transition duration-300 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
const ghostButton = "rounded-[10px] border border-line px-5 py-3 text-[15px] font-semibold text-ink-600 transition duration-300 hover:border-brand-500 hover:text-brand-500";
function Notice({ tone = "error", children }) {
    const styles = tone === "error" ? "bg-brand-100 text-brand-600" : "bg-ink-900/5 text-ink-600";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: `rounded-[10px] px-4 py-3 text-sm ${styles}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/dashboard/DashboardShell.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
_c = Notice;
function DashboardShell({ title, description, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Nav"], {}, void 0, false, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "mx-auto w-full max-w-3xl px-5 py-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold tracking-tight sm:text-3xl",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-ink-600",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 44,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c1 = DashboardShell;
function RequireSignIn({ children }) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClerkConfigured"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardShell, {
            title: "Not available in this build",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Notice, {
                children: [
                    "This page needs both Clerk and Supabase keys in",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        className: "font-mono",
                        children: "web/.env.local"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this),
                    ". Add the Clerk",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "development"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    " key (",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        className: "font-mono",
                        children: "pk_test_…"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 58,
                        columnNumber: 45
                    }, this),
                    ") for local work — a production key only works on the live domain."
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 55,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/dashboard/DashboardShell.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RequireSignInLive, {
        children: children
    }, void 0, false, {
        fileName: "[project]/components/dashboard/DashboardShell.tsx",
        lineNumber: 64,
        columnNumber: 10
    }, this);
}
_c2 = RequireSignIn;
function RequireSignInLive({ children }) {
    _s();
    const { isLoaded, isSignedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"])();
    if (!isLoaded) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardShell, {
            title: "Loading…",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-32 animate-pulse rounded-[10px] bg-ink-900/5"
            }, void 0, false, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 73,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/dashboard/DashboardShell.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this);
    }
    if (!isSignedIn) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardShell, {
            title: "Sign in to continue",
            description: "Your business page and items live with your account.",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/sign-in",
                        className: primaryButton,
                        children: "Login"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/sign-up",
                        className: ghostButton,
                        children: "Sign up"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/dashboard/DashboardShell.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, this);
    }
    // The app requires the agreement before any signed-in use; so does this.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConsentGate$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConsentGate"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/components/dashboard/DashboardShell.tsx",
        lineNumber: 97,
        columnNumber: 10
    }, this);
}
_s(RequireSignInLive, "2ynefrmBTeC1iOUiW2RTyBnnoVc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"]
    ];
});
_c3 = RequireSignInLive;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Notice");
__turbopack_context__.k.register(_c1, "DashboardShell");
__turbopack_context__.k.register(_c2, "RequireSignIn");
__turbopack_context__.k.register(_c3, "RequireSignInLive");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/formatPrice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Price presentation, matching the mobile app's lib/formatPrice.ts. */ __turbopack_context__.s([
    "PRICE_TYPE_OPTIONS",
    ()=>PRICE_TYPE_OPTIONS,
    "formatPrice",
    ()=>formatPrice,
    "whatsappHref",
    ()=>whatsappHref
]);
const PRICE_TYPE_OPTIONS = [
    {
        value: "exact",
        label: "UGX"
    },
    {
        value: "from",
        label: "From UGX"
    },
    {
        value: "upto",
        label: "Up to UGX"
    }
];
function formatPrice(price, priceType) {
    if (!price) return null;
    switch(priceType){
        case "from":
            return `From UGX ${price}`;
        case "upto":
            return `Up to UGX ${price}`;
        default:
            return `UGX ${price}`;
    }
}
function whatsappHref(phone, text) {
    const digits = phone.replace(/\D/g, "");
    const query = text ? `?text=${encodeURIComponent(text)}` : "";
    return `https://wa.me/${digits}${query}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/access-customer/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccessCustomerPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+shared@4.29.1_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useUser as h> <export h as useUser>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/admin.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/DashboardShell.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$formatPrice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/formatPrice.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function AccessCustomerPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RequireSignIn"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AccessCustomer, {}, void 0, false, {
            fileName: "[project]/app/access-customer/page.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/access-customer/page.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = AccessCustomerPage;
function AccessCustomer() {
    _s();
    const [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [district, setDistrict] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [customer, setCustomer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searching, setSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleSubmit = async (event)=>{
        event.preventDefault();
        if (!phone.trim() || !district.trim()) {
            setError("Phone and district are both required.");
            return;
        }
        setError(null);
        setCustomer(null);
        setSearching(true);
        try {
            setCustomer(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lookupCustomer"])(phone.trim(), district.trim()));
        } catch (e) {
            setError(e instanceof Error ? e.message : "No customer matched those details.");
        } finally{
            setSearching(false);
        }
    };
    const mapsHref = customer?.latitude != null && customer.longitude != null ? `https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}` : null;
    const locationText = customer ? [
        `${customer.fullName}'s location`,
        [
            customer.street,
            customer.village,
            customer.town,
            customer.district
        ].filter(Boolean).join(", "),
        mapsHref
    ].filter(Boolean).join("\n") : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DashboardShell"], {
        title: "Find a customer",
        description: "Enter the phone number and district a buyer gave you to see their delivery details.",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "flex flex-col gap-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-5 sm:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["label"],
                                        htmlFor: "phone",
                                        children: "Phone number *"
                                    }, void 0, false, {
                                        fileName: "[project]/app/access-customer/page.tsx",
                                        lineNumber: 77,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "phone",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["input"],
                                        value: phone,
                                        onChange: (e)=>setPhone(e.target.value),
                                        placeholder: "e.g. +256700000000",
                                        inputMode: "tel"
                                    }, void 0, false, {
                                        fileName: "[project]/app/access-customer/page.tsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["label"],
                                        htmlFor: "district",
                                        children: "District *"
                                    }, void 0, false, {
                                        fileName: "[project]/app/access-customer/page.tsx",
                                        lineNumber: 90,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "district",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["input"],
                                        value: district,
                                        onChange: (e)=>setDistrict(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/access-customer/page.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Notice"], {
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 102,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["primaryButton"],
                            disabled: searching,
                            children: searching ? "Searching…" : "Find customer"
                        }, void 0, false, {
                            fileName: "[project]/app/access-customer/page.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdminCustomerList, {}, void 0, false, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            customer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "mt-10 rounded-[10px] border border-line p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold tracking-tight",
                        children: customer.fullName
                    }, void 0, false, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-ink-600",
                        children: [
                            customer.street,
                            customer.village,
                            customer.town,
                            customer.district
                        ].filter(Boolean).join(", ")
                    }, void 0, false, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    customer.addressPhotoUrl && // eslint-disable-next-line @next/next/no-img-element
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: customer.addressPhotoUrl,
                        alt: "Customer address",
                        className: "mt-4 w-full max-w-sm rounded-[10px] border border-line object-cover"
                    }, void 0, false, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 124,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-5 flex flex-wrap gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$formatPrice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["whatsappHref"])(customer.phone),
                                target: "_blank",
                                rel: "noreferrer",
                                className: "rounded-[10px] bg-[#25D366] px-5 py-3 text-[15px] font-semibold text-white transition hover:brightness-95",
                                children: "Message on WhatsApp"
                            }, void 0, false, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            mapsHref && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: mapsHref,
                                target: "_blank",
                                rel: "noreferrer",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ghostButton"],
                                children: "Open in Google Maps"
                            }, void 0, false, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 141,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ghostButton"],
                                onClick: ()=>void navigator.clipboard.writeText(locationText),
                                children: "Copy location"
                            }, void 0, false, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/access-customer/page.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_s(AccessCustomer, "2SueXt2JbfulWAIdMrCiXFmtMYk=");
_c1 = AccessCustomer;
/**
 * The full customer directory, which the mobile access-customer screen shows to
 * the admin account only. RLS enforces the same rule server-side, so this is
 * presentation, not protection.
 */ function AdminCustomerList() {
    _s1();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__["useUser"])();
    const [customers, setCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const isAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isAdminUser"])(user);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminCustomerList.useEffect": ()=>{
            if (!isAdmin) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminCustomers"])().then(setCustomers).catch({
                "AdminCustomerList.useEffect": (e)=>setError(e instanceof Error ? e.message : "Could not load customers.")
            }["AdminCustomerList.useEffect"]).finally({
                "AdminCustomerList.useEffect": ()=>setLoading(false)
            }["AdminCustomerList.useEffect"]);
        }
    }["AdminCustomerList.useEffect"], [
        isAdmin
    ]);
    if (!isAdmin) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mt-12",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-bold tracking-tight",
                children: [
                    "All customers",
                    " ",
                    !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium text-ink-400",
                        children: [
                            "(",
                            customers.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 188,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Notice"], {
                    children: error
                }, void 0, false, {
                    fileName: "[project]/app/access-customer/page.tsx",
                    lineNumber: 193,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 192,
                columnNumber: 9
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 h-24 animate-pulse rounded-[10px] bg-ink-900/5"
            }, void 0, false, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 198,
                columnNumber: 9
            }, this) : customers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-ink-600",
                children: "No delivery profiles saved yet."
            }, void 0, false, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 200,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "mt-4 flex flex-col gap-3",
                children: customers.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex flex-wrap items-center gap-3 rounded-[10px] border border-line p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "truncate font-semibold",
                                        children: entry.fullName
                                    }, void 0, false, {
                                        fileName: "[project]/app/access-customer/page.tsx",
                                        lineNumber: 209,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "truncate text-sm text-ink-400",
                                        children: [
                                            entry.street,
                                            entry.village,
                                            entry.town,
                                            entry.district
                                        ].filter(Boolean).join(", ")
                                    }, void 0, false, {
                                        fileName: "[project]/app/access-customer/page.tsx",
                                        lineNumber: 210,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 208,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$formatPrice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["whatsappHref"])(entry.phone),
                                target: "_blank",
                                rel: "noreferrer",
                                className: "shrink-0 text-sm font-semibold text-[#25D366] transition hover:brightness-90",
                                children: entry.phone
                            }, void 0, false, {
                                fileName: "[project]/app/access-customer/page.tsx",
                                lineNumber: 216,
                                columnNumber: 15
                            }, this)
                        ]
                    }, entry.id, true, {
                        fileName: "[project]/app/access-customer/page.tsx",
                        lineNumber: 204,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/access-customer/page.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/access-customer/page.tsx",
        lineNumber: 185,
        columnNumber: 5
    }, this);
}
_s1(AdminCustomerList, "Ihjmc+FfBm5Nkb1lV0IWLjrFCVo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__["useUser"]
    ];
});
_c2 = AdminCustomerList;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "AccessCustomerPage");
__turbopack_context__.k.register(_c1, "AccessCustomer");
__turbopack_context__.k.register(_c2, "AdminCustomerList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1k64ibl._.js.map