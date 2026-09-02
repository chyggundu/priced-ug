"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createProduct,
  getCategories,
  getMyBusiness,
  type Category,
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

const PRICE_TYPE_OPTIONS = [
  { value: "exact", label: "UGX" },
  { value: "from", label: "From UGX" },
  { value: "upto", label: "Up to UGX" },
] as const;

const CONDITION_OPTIONS = ["New", "Slightly Used", "Used"] as const;

const MAX_PHOTOS = 7;

/** Mirrors the mobile app's add-product screen, field for field. */
export default function AddProductPage() {
  return (
    <RequireSignIn>
      <AddProduct />
    </RequireSignIn>
  );
}

function AddProduct() {
  const router = useRouter();

  const [businessId, setBusinessId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<string>("exact");
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
    Promise.all([getMyBusiness(), getCategories()])
      .then(([business, cats]) => {
        setBusinessId(business?.id ?? null);
        setCategories(cats);
      })
      .catch((e: unknown) =>
        setLoadError(e instanceof Error ? e.message : "Could not load the form."),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (categoryId == null) {
      setError("Please choose a category for this item.");
      return;
    }
    if (businessId == null) {
      setError("Create your business page first.");
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
      await createProduct(businessId, payload);
      router.push("/my-business");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Add item">
        <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  if (loadError) {
    return (
      <DashboardShell title="Add item">
        <Notice>{loadError}</Notice>
      </DashboardShell>
    );
  }

  if (businessId == null) {
    return (
      <DashboardShell
        title="Create your business page first"
        description="Items belong to a business page, so that comes first."
      >
        <a href="/my-business" className={primaryButton}>
          Go to my business
        </a>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Add item" description="List a product or service on your business page.">
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
          <input
            id="name"
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hisense 55 inch TV"
          />
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
            placeholder="Describe the item..."
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
              placeholder="e.g. 250,000"
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
            <input
              id="color"
              className={input}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
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

        <div className="flex gap-3">
          <button type="submit" className={primaryButton} disabled={saving}>
            {saving ? "Saving…" : "Add item"}
          </button>
          <button type="button" className={ghostButton} onClick={() => router.push("/my-business")}>
            Cancel
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
