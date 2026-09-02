"use client";

import { useEffect, useState } from "react";
import {
  getMyCustomerProfile,
  saveMyCustomerProfile,
  type CustomerInput,
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

/** Mirrors the mobile app's customer-profile screen. */
export default function CustomerProfilePage() {
  return (
    <RequireSignIn>
      <CustomerProfile />
    </RequireSignIn>
  );
}

function CustomerProfile() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [village, setVillage] = useState("");
  const [street, setStreet] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyCustomerProfile()
      .then((profile) => {
        if (!profile) return;
        setFullName(profile.fullName);
        setPhone(profile.phone);
        setDistrict(profile.district);
        setTown(profile.town ?? "");
        setVillage(profile.village ?? "");
        setStreet(profile.street ?? "");
        setPhotoUrls(profile.addressPhotoUrl ? [profile.addressPhotoUrl] : []);
        if (profile.latitude != null && profile.longitude != null) {
          setCoords({ latitude: profile.latitude, longitude: profile.longitude });
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("This browser cannot share your location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setError("Location permission was denied."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !district.trim()) {
      setError("Name, phone and district are required.");
      return;
    }
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const payload: CustomerInput = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        district: district.trim(),
        town: town.trim() || null,
        village: village.trim() || null,
        street: street.trim() || null,
        addressPhotoUrl: photoUrls[0] ?? null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      };
      await saveMyCustomerProfile(payload);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Delivery profile">
        <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Delivery profile"
      description="Businesses use these details to find you when delivering an order."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={label} htmlFor="fullName">
            Full name *
          </label>
          <input
            id="fullName"
            className={input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className={label} htmlFor="phone">
            Phone / WhatsApp Number *
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
            <label className={label} htmlFor="district">
              District *
            </label>
            <input
              id="district"
              className={input}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="town">
              Town
            </label>
            <input id="town" className={input} value={town} onChange={(e) => setTown(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="village">
              Village
            </label>
            <input
              id="village"
              className={input}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="street">
              Street
            </label>
            <input
              id="street"
              className={input}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
        </div>

        <ImageField
          title="Address photo"
          urls={photoUrls}
          onChange={setPhotoUrls}
          hint="A photo of your gate or building helps a rider find you."
        />

        <div>
          <span className={label}>Map pin</span>
          <p className="mt-1 text-sm text-ink-400">
            {coords
              ? `Saved: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
              : "No pin saved yet."}
          </p>
          <button type="button" className={`${ghostButton} mt-3`} onClick={useMyLocation}>
            Use my current location
          </button>
        </div>

        {error && <Notice>{error}</Notice>}
        {saved && <Notice tone="info">Profile saved.</Notice>}

        <div>
          <button type="submit" className={primaryButton} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
