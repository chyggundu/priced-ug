import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/expo";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextValue {
  isAdmin: boolean;
  userId: string | null | undefined;
}

const AuthContext = createContext<AuthContextValue>({ isAdmin: false, userId: null });

const ADMIN_USER_ID = process.env.EXPO_PUBLIC_ADMIN_USER_ID ?? "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId, getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  const isAdmin = !!userId && !!ADMIN_USER_ID && userId === ADMIN_USER_ID;

  return (
    <AuthContext.Provider value={{ isAdmin, userId: userId ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
