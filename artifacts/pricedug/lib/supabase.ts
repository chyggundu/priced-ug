import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * False when the keys are absent, so screens can degrade instead of throwing.
 * Browsing is public, but a missing key still means no data at all — callers
 * check this rather than letting `createClient` fail at import time.
 */
export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/*
  Clerk stays the identity provider; Supabase is only the datastore. Supabase's
  third-party auth accepts a Clerk session token directly, so `accessToken`
  hands it the live Clerk JWT on every request and RLS reads the Clerk user id
  from the `sub` claim. Nothing is persisted here — Clerk's own token cache
  already owns session storage, and a second copy would only drift.
*/
let getClerkToken: (() => Promise<string | null>) | null = null;

/**
 * Registered once, from the Clerk-aware provider tree. Until it runs, requests
 * go out with the anon key alone — which is exactly right for public browsing.
 */
export function setSupabaseTokenGetter(getter: (() => Promise<string | null>) | null): void {
  getClerkToken = getter;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Clerk owns the session; Supabase must not try to persist or refresh one.
    persistSession: false,
    autoRefreshToken: false,
    // React Native has no URL bar to parse a session out of.
    detectSessionInUrl: false,
  },
  accessToken: async () => {
    if (!getClerkToken) return null;
    try {
      return await getClerkToken();
    } catch {
      // A failed token fetch must degrade to anonymous, not break the request.
      return null;
    }
  },
});
