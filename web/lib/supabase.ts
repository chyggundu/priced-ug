import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The website's own Supabase client. It mirrors the mobile app's setup
 * (artifacts/pricedug + lib/api-client-react) but shares no code with it: same
 * project, same RLS, separate implementation and separate env.
 *
 * Every request carries the Clerk session token, which is what Postgres RLS
 * reads via `clerk_uid()`. Without a token the client still works — it just sees
 * exactly what an anonymous visitor is allowed to see.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

export const BUCKET = "uploads";

type TokenGetter = () => Promise<string | null | undefined>;

let tokenGetter: TokenGetter | null = null;
let currentUserId: string | null = null;
let client: SupabaseClient | null = null;

/**
 * Registered by SupabaseAuthBridge once Clerk has loaded. Never let this reject:
 * supabase-js aborts the request outright if the accessToken callback throws,
 * which surfaces as confusing "failed to fetch"-style errors far from the cause.
 */
export function setAuthTokenGetter(getter: TokenGetter | null): void {
  tokenGetter = getter;
}

export function setCurrentUserId(id: string | null): void {
  currentUserId = id;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export function sb(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local.",
    );
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      accessToken: async () => {
        if (!tokenGetter) return null;
        try {
          return (await tokenGetter()) ?? null;
        } catch {
          return null;
        }
      },
    });
  }
  return client;
}

export const supabaseUrl = url;
