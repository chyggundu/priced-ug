"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBusiness, updateMyBusiness, type Business, type BusinessInput } from "@/lib/api";
import { ImageField } from "./ImageField";
import { Notice, ghostButton, input, label, primaryButton } from "./DashboardShell";

/**
 * Create/edit form for a business page, with the same fields as the mobile app's
 * edit-business screen.
 */
export function BusinessForm({ business }: { business: Business | null }) {
  const router = useRouter();

  const [name, setName] = useState(business?.name ?? "");
  const [description, setDescription] = useState(business?.description ?? "");
  const [city, setCity] = useState(business?.city ?? "");
  const [address, setAddress] = useState(business?.address ?? "");
  const [phone, setPhone] = useState(business?.phone ?? "");
  const [openingTime, setOpeningTime] = useState(business?.openingTime ?? "");
  const [closingTime, setClosingTime] = useState(business?.closingTime ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(business?.imageUrl ? [business.imageUrl] : []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: BusinessInput = {
        name: name.trim(),
        description: description.trim() || null,
        city: city.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        openingTime: openingTime.trim() || null,
        closingTime: closingTime.trim() || null,
        imageUrl: imageUrls[0] ?? null,
      };
      if (business) {
        await updateMyBusiness(business.id, payload);
      } else {
        await createBusiness(payload);
      }
      router.push("/my-business");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ImageField
        title="Banner image"
        urls={imageUrls}
        onChange={setImageUrls}
        hint="Shown at the top of your business page."
      />

      <div>
        <label className={label} htmlFor="name">
          Business name *
        </label>
        <input
          id="name"
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kampala Fashion House"
        />
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
          placeholder="Describe your business and what you offer..."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="city">
            City
          </label>
          <input
            id="city"
            className={input}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Kampala"
          />
        </div>
        <div>
          <label className={label} htmlFor="address">
            Address
          </label>
          <input
            id="address"
            className={input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Nakasero Market"
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="phone">
          Phone / WhatsApp Number
        </label>
        <input
          id="phone"
          className={input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +256700000000"
          inputMode="tel"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="openingTime">
            Opening time
          </label>
          <input
            id="openingTime"
            className={input}
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            placeholder="e.g. 8:00 AM"
          />
        </div>
        <div>
          <label className={label} htmlFor="closingTime">
            Closing time
          </label>
          <input
            id="closingTime"
            className={input}
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            placeholder="e.g. 7:00 PM"
          />
        </div>
      </div>

      {error && <Notice>{error}</Notice>}

      <div className="flex gap-3">
        <button type="submit" className={primaryButton} disabled={saving}>
          {saving ? "Saving…" : business ? "Save changes" : "Create business page"}
        </button>
        {business && (
          <button type="button" className={ghostButton} onClick={() => router.push("/my-business")}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
