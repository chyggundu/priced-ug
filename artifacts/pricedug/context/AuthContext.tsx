import React, { createContext, useContext, useEffect } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { setAuthTokenGetter, setCurrentUserId } from "@workspace/api-client-react";

interface AuthContextValue {
  isAdmin: boolean;
  userId: string | null | undefined;
}

const AuthContext = createContext<AuthContextValue>({ isAdmin: false, userId: null });

// Admin is determined by verified email so it stays stable across the dev and
// production Clerk instances (Clerk user IDs differ between them). Keep this in
// sync with the Supabase `is_admin()` DB function.
const ADMIN_EMAIL = (process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? "priceduganda@gmail.com").toLowerCase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setAuthTokenGetter(() => getToken({ template: "supabase" }));
  }, [getToken]);

  useEffect(() => {
    setCurrentUserId(userId ?? null);
  }, [userId]);

  const adminEmailVerified = (user?.emailAddresses ?? []).some(
    (e) => e.emailAddress.toLowerCase() === ADMIN_EMAIL && e.verification?.status === "verified",
  );
  const isAdmin = !!userId && adminEmailVerified;

  return (
    <AuthContext.Provider value={{ isAdmin, userId: userId ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
