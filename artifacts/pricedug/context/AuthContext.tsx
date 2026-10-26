import React, { createContext, useContext, useEffect } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { setSupabaseTokenGetter } from "@/lib/supabase";

interface AuthContextValue {
  isAdmin: boolean;
  userId: string | null | undefined;
}

const AuthContext = createContext<AuthContextValue>({ isAdmin: false, userId: null });

/*
  Admin is decided by verified email, matching the website and Supabase's own
  `is_admin()`. It used to compare against a Clerk user id, which broke twice
  over: ids differ between Clerk's development and production instances, and
  the variable was never set, so no one was ever an admin.

  More than one address can hold admin rights (e.g. a second account used for
  testing or App Store review access) via a comma-separated env var.
*/
const ADMIN_EMAILS = (
  process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? "priceduganda@gmail.com,pricedugadmin@yopmail.com"
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Supabase verifies this same Clerk token as a third-party provider, so
    // RLS reads the Clerk user id from the `sub` claim.
    setSupabaseTokenGetter(() => getToken());
  }, [getToken]);

  const isAdmin = !!user?.emailAddresses.some(
    (email) =>
      ADMIN_EMAILS.includes(email.emailAddress.toLowerCase()) &&
      email.verification?.status === "verified",
  );

  return (
    <AuthContext.Provider value={{ isAdmin, userId: userId ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
