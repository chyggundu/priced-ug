import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSSO } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

/*
  Closes the auth session popup left behind when the OAuth redirect lands back
  on the app. Must run at module scope, before any browser session opens.
*/
WebBrowser.maybeCompleteAuthSession();

/**
 * "Continue with Google", mirroring the web app's button.
 *
 * Native cannot do a plain page redirect, so this opens Google in a system
 * auth session and Clerk hands back a session id once the browser returns to
 * the app's `pricedug://` scheme. That differs from web, where the browser
 * navigates away and /sso-callback finishes the handshake.
 */
export function GoogleAuthButton({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
    Android keeps the custom-tab process cold, which adds a visible delay on
    first tap. Warming it up while the user is still reading the form hides
    that. No-op on iOS and web.
  */
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const onPress = async () => {
    setBusy(true);
    setError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        /*
          This exact URL has to be allowlisted on the Clerk instance, so it is
          built the same way Clerk itself defaults to — `pricedug://sso-callback`
          in a dev/production build, `exp://<host>/--/sso-callback` in Expo Go.
          Do not point it at a router group like `/(tabs)`: the parentheses are
          an expo-router convention, not URL syntax, and Clerk rejects it.
        */
        redirectUrl: AuthSession.makeRedirectUri({ path: "sso-callback" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
        return;
      }

      /*
        No session means Clerk needs more from the user — MFA, or a field the
        Google profile did not supply. The user cancelling also lands here, and
        that is not an error worth showing.
      */
      setBusy(false);
    } catch (e) {
      const detail =
        (e as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0]
          ?.longMessage ??
        (e as Error)?.message ??
        "Please try again.";
      setError(detail);
      setBusy(false);
    }
  };

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onPress}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={
          mode === "sign-up" ? "Sign up with Google" : "Sign in with Google"
        }
      >
        {busy ? (
          <ActivityIndicator color="#888888" />
        ) : (
          <>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </>
        )}
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EBEBEB",
  },
  dividerText: {
    color: "#888888",
    fontSize: 14,
    marginHorizontal: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 10,
    paddingVertical: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleG: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#4285F4",
    marginRight: 10,
  },
  buttonText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  error: {
    color: "#CC0020",
    fontSize: 13,
    marginTop: 8,
  },
});
