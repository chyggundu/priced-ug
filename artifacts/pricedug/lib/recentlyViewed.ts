import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recently_viewed_businesses_v1";
const MAX_ITEMS = 10;

export type RecentBusiness = {
  id: number;
  name: string;
  imageUrl: string | null;
  city: string | null;
  viewedAt: number;
};

export async function getRecentlyViewed(): Promise<RecentBusiness[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordBusinessView(business: {
  id: number;
  name: string;
  imageUrl?: string | null;
  city?: string | null;
}): Promise<void> {
  try {
    const existing = await getRecentlyViewed();
    const entry: RecentBusiness = {
      id: business.id,
      name: business.name,
      imageUrl: business.imageUrl ?? null,
      city: business.city ?? null,
      viewedAt: Date.now(),
    };
    const next = [entry, ...existing.filter((b) => b.id !== business.id)].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Best-effort only.
  }
}
