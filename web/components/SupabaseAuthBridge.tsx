"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setAuthTokenGetter, setCurrentUserId } from "@/lib/supabase";

/**
 * Hands the Clerk session token to the Supabase client, mirroring the mobile
 * app's AuthContext. Supabase's Clerk integration takes the plain session token;
 * an older setup used a "supabase" JWT template, so try the template first and
 * fall back — and never throw, because supabase-js abandons a request entirely
 * if this callback rejects.
 */
export function SupabaseAuthBridge() {
  const { userId, getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        const templated = await getToken({ template: "supabase" });
        if (templated) return templated;
      } catch {
        // No such template on this Clerk instance — fall through.
      }
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  useEffect(() => {
    setCurrentUserId(userId ?? null);
  }, [userId]);

  return null;
}
