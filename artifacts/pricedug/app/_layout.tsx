import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { persistOptions, queryClient } from "@/lib/queryClient";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="business/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-business" options={{ headerShown: false }} />
      <Stack.Screen name="add-product" options={{ headerShown: false }} />
      <Stack.Screen name="edit-product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="customer-profile" options={{ headerShown: false }} />
      <Stack.Screen name="access-customer" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    /*
      The splash screen used to stay up until Inter finished loading, and the
      tree returned null until then. Text renders in the system font for the
      first frame instead — a font swap is far cheaper than a blank screen.
    */
    SplashScreen.hideAsync();
  }, []);

  // `fontsLoaded` is intentionally not gating render; it is read only so the
  // hook's result is used and the font swap re-renders when it arrives.
  void fontsLoaded;
  void fontError;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          {/*
            ClerkLoaded used to wrap this whole tree, so nothing at all painted
            until Clerk had read its token cache and reached the network.
            Browsing is public, so the app renders straight away and the screens
            that do care about auth read `isSignedIn`/`isLoaded` themselves.
          */}
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={persistOptions}
          >
            <AuthProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AuthProvider>
          </PersistQueryClientProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
