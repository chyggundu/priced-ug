import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      const goHome = async ({ session, decorateUrl }: any) => {
        if (session?.currentTask) {
          return;
        }
        const url = decorateUrl("/");
        if (url.startsWith("http")) return;
        router.replace("/(tabs)");
      };

      if (createdSessionId) {
        await setActive!({ session: createdSessionId, navigate: goHome });
        return;
      }

      // No session yet — Clerk stopped part-way ("Almost there"). Finish the
      // remaining steps ourselves: satisfy sign-up requirements (e.g. legal
      // consent) and run Clerk's bidirectional transfer flow between the
      // sign-in and sign-up objects.
      let sessionId: string | null = null;

      try {
        if (signUp && signUp.status === "missing_requirements") {
          let current = signUp;
          if (current.missingFields.includes("legal_accepted")) {
            current = await current.update({ legalAccepted: true });
          } else if (
            current.missingFields.length === 0 &&
            current.unverifiedFields.length === 0
          ) {
            current = await current.update({});
          }
          if (current.status === "complete" && current.createdSessionId) {
            sessionId = current.createdSessionId;
          }
        }

        if (
          !sessionId &&
          signUp &&
          signIn?.firstFactorVerification?.status === "transferable"
        ) {
          const transferred = await signUp.create({ transfer: true });
          if (transferred.status === "complete" && transferred.createdSessionId) {
            sessionId = transferred.createdSessionId;
          }
        }

        if (
          !sessionId &&
          signIn &&
          signUp?.verifications?.externalAccount?.status === "transferable"
        ) {
          const transferred = await signIn.create({ transfer: true });
          if (transferred.status === "complete" && transferred.createdSessionId) {
            sessionId = transferred.createdSessionId;
          }
        }
      } catch {
        // fall through to the alert below
      }

      if (sessionId) {
        await setActive!({ session: sessionId, navigate: goHome });
        return;
      }

      const pending = [
        ...(signUp?.missingFields ?? []),
        ...(signUp?.unverifiedFields ?? []),
      ];
      const missing = pending.length ? ` (needs: ${pending.join(", ")})` : "";
      Alert.alert(
        "Almost there",
        `Google sign-in needs one more step${missing}. Please try again or use email and password.`
      );
    } catch (err: any) {
      // Surface Clerk's real reason (Clerk errors carry an `errors[]` array) so
      // config problems (Google connection off, missing prod OAuth credentials,
      // redirect not allow-listed) are visible instead of a generic message.
      const detail =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        "Please try again.";
      Alert.alert("Google sign-in failed", detail);
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, router]);

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={[styles.googleButton, loading && styles.buttonDisabled]}
        onPress={onPress}
        disabled={loading}
        accessibilityLabel="Continue with Google"
      >
        {loading ? (
          <ActivityIndicator color="#555555" />
        ) : (
          <>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    color: "#888888",
    fontSize: 13,
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingVertical: 14,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleG: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#4285F4",
  },
  googleText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
