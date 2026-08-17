"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  deleteProduct,
  getCategories,
  getProduct,
  updateProduct,
  type Category,
  type Product,
  type ProductInput,
} from "@/lib/api";
import { ImageField } from "@/components/dashboard/ImageField";
import {
  DashboardShell,
  Notice,
  RequireSignIn,
  ghostButton,
  input,
  label,
  primaryButton,
} from "@/components/dashboard/DashboardShell";
import { PRICE_TYPE_OPTIONS } from "@/lib/formatPrice";

const CONDITION_OPTIONS = ["New", "Slightly Used", "Used"] as const;
const MAX_PHOTOS = 7;

/** Mirrors the mobile app's edit-product screen. */
export default function EditProductPage() {
  return (
    <RequireSignIn>
      <Suspense fallback={<DashboardShell title="Edit item">{null}</DashboardShell>}>
        <EditProduct />
      </Suspense>
    </RequireSignIn>
  );
}

function EditProduct() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = Number(params.get("id"));

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("exact");
  const [size, setSize] = useState("");
  const [materials, setMaterials] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [deliveredByPricedUg, setDeliveredByPricedUg] = useState(false);
  const [deliveredByBusiness, setDeliveredByBusiness] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setLoadError("No item selected.");
      setLoading(false);
      return;
    }
    Promise.all([getProduct(productId), getCategories()])
      .then(([product, cats]: [Product, Category[]]) => {
        setCategories(cats);
        setName(product.name);
        setCategoryId(product.categoryId);
        setDescription(product.description ?? "");
        setPrice(product.price ?? "");
        setPriceType(product.priceType ?? "exact");
        setSize(product.size ?? "");
        setMaterials(product.materials ?? "");
        setColor(product.color ?? "");
        setCondition(product.condition ?? "");
        setImageUrls(product.imageUrls.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : []);
        setVideoUrls(product.videoUrl ? [product.videoUrl] : []);
        setDeliveredByPricedUg(product.deliveredByPricedUg);
        setDeliveredByBusiness(product.deliveredByBusiness);
      })
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : "Could not load the item."))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (categoryId == null) {
      setError("Please choose a category for this item.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: ProductInput = {
        name: name.trim(),
        categoryId,
        description: description.trim() || null,
        price: price.trim() || null,
        priceType,
        size: size.trim() || null,
        materials: materials.trim() || null,
        color: color.trim() || null,
        condition: condition || null,
        imageUrl: imageUrls[0] ?? null,
        imageUrls,
        videoUrl: videoUrls[0] ?? null,
        deliveredByPricedUg,
        deliveredByBusiness,
      };
      await updateProduct(productId, payload);
      router.push("/my-business");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    setSaving(true);
    try {
      await deleteProduct(productId);
      router.push("/my-business");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the item.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Edit item">
        <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  if (loadError) {
    return (
      <DashboardShell title="Edit item">
        <Notice>{loadError}</Notice>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Edit item">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <ImageField
          title={`Photos (up to ${MAX_PHOTOS})`}
          urls={imageUrls}
          onChange={setImageUrls}
          max={MAX_PHOTOS}
          hint="The first photo is used as the item's cover."
        />

        <ImageField
          title="Video (optional)"
          urls={videoUrls}
          onChange={setVideoUrls}
          accept="video/*"
          hint="A short clip, up to 60 seconds and 50 MB."
        />

        <div>
          <label className={label} htmlFor="name">
            Item name *
          </label>
          <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className={label} htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            className={input}
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Choose a category…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={`${input} min-h-28`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
          <div>
            <label className={label} htmlFor="priceType">
              Price type
            </label>
            <select
              id="priceType"
              className={input}
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              {PRICE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="price">
              Price
            </label>
            <input
              id="price"
              className={input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={label} htmlFor="size">
              Size
            </label>
            <input id="size" className={input} value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="materials">
              Materials
            </label>
            <input
              id="materials"
              className={input}
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="color">
              Colour
            </label>
            <input id="color" className={input} value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>

        <div>
          <span className={label}>Condition</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCondition((c) => (c === option ? "" : option))}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  condition === option
                    ? "bg-brand-500 text-white"
                    : "border border-line text-ink-600 hover:border-brand-500 hover:text-brand-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className={label}>Delivery</legend>
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2.5 text-[15px] text-ink-600">
              <input
                type="checkbox"
                checked={deliveredByBusiness}
                onChange={(e) => setDeliveredByBusiness(e.target.checked)}
                className="size-4 accent-brand-500"
              />
              Delivered by my business
            </label>
            <label className="flex items-center gap-2.5 text-[15px] text-ink-600">
              <input
                type="checkbox"
                checked={deliveredByPricedUg}
                onChange={(e) => setDeliveredByPricedUg(e.target.checked)}
                className="size-4 accent-brand-500"
              />
              Delivered by Priced Ug
            </label>
          </div>
        </fieldset>

        {error && <Notice>{error}</Notice>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={primaryButton} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" className={ghostButton} onClick={() => router.push("/my-business")}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-[10px] px-5 py-3 text-[15px] font-semibold text-brand-600 transition hover:bg-brand-100 disabled:opacity-50"
          >
            Delete item
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
