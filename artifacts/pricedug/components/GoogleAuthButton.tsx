import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useClerk, useSSO } from "@clerk/expo";
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

/**
 * Polls the Clerk client for a session that appeared without the SSO flow
 * reporting it, activating it if it is sitting on the client but not current.
 * Returns true once the user is signed in.
 *
 * Clerk needs a moment to sync the client after the browser closes, hence the
 * retries rather than a single check.
 */
async function waitForRecoveredSession(
  clerk: ReturnType<typeof useClerk>,
  goHome: (opts: any) => Promise<void>,
  priorSessionId: string | null,
): Promise<boolean> {
  for (let attempt = 0; attempt < 10; attempt++) {
    // Compare against the session held before the flow started, so a stale one
    // can never be mistaken for a successful sign-in.
    if (clerk.session && clerk.session.id !== priorSessionId) return true;

    const active = (clerk.client?.sessions ?? []).find(
      (s: any) => s.status === "active" || s.status === "pending",
    );
    if (active) {
      try {
        await clerk.setActive({ session: active.id, navigate: goHome });
        return true;
      } catch {
        // Fall through and keep polling — a later attempt may succeed.
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}

export default function GoogleAuthButton() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    setLoading(true);
    // Snapshot before the flow so recovery can tell a new session from an old one.
    const priorSessionId = clerk.session?.id ?? null;
    try {
      const { createdSessionId, authSessionResult, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // Closing the Google page (back gesture, "Cancel", swiping the sheet away)
      // resolves the flow with no session and nothing to recover. That is not an
      // error, so say nothing rather than accusing the user of a failed sign-in.
      if (authSessionResult && authSessionResult.type !== "success") {
        return;
      }

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
      // The last sign-up state we saw, so the fallback message reports what is
      // actually outstanding rather than the stale fields of the original object.
      let latestSignUp = signUp;
      let recoveryError: unknown = null;

      const absorb = async <T,>(step: () => Promise<T>): Promise<T | null> => {
        try {
          return await step();
        } catch (e) {
          // Keep the first real reason. Discarding it is what turned every
          // failure here into the same unactionable "Almost there".
          recoveryError ??= e;
          return null;
        }
      };

      if (signUp && signUp.status === "missing_requirements") {
        // Clerk's legal-consent requirement is the one gap the app can close by
        // itself — the user already accepted the agreement at launch.
        if (signUp.missingFields.includes("legal_accepted")) {
          latestSignUp = (await absorb(() => signUp.update({ legalAccepted: true }))) ?? signUp;
        } else if (signUp.missingFields.length === 0 && signUp.unverifiedFields.length === 0) {
          latestSignUp = (await absorb(() => signUp.update({}))) ?? signUp;
        }
        if (latestSignUp?.status === "complete" && latestSignUp.createdSessionId) {
          sessionId = latestSignUp.createdSessionId;
        }
      }

      // No account for this Google identity yet → carry the verified OAuth
      // identity over to a sign-up.
      if (!sessionId && signUp && signIn?.firstFactorVerification?.status === "transferable") {
        const transferred = await absorb(() => signUp.create({ transfer: true }));
        if (transferred) latestSignUp = transferred;
        if (transferred?.status === "complete" && transferred.createdSessionId) {
          sessionId = transferred.createdSessionId;
        } else if (
          transferred?.status === "missing_requirements" &&
          transferred.missingFields.includes("legal_accepted")
        ) {
          // A transferred sign-up can land straight back in missing_requirements;
          // the original code gave up here, which is the dead end users hit.
          const consented = await absorb(() => transferred.update({ legalAccepted: true }));
          if (consented) latestSignUp = consented;
          if (consented?.status === "complete" && consented.createdSessionId) {
            sessionId = consented.createdSessionId;
          }
        }
      }

      // An account already exists for this email → carry it over to a sign-in.
      if (!sessionId && signIn && signUp?.verifications?.externalAccount?.status === "transferable") {
        const transferred = await absorb(() => signIn.create({ transfer: true }));
        if (transferred?.status === "complete" && transferred.createdSessionId) {
          sessionId = transferred.createdSessionId;
        }
      }

      if (sessionId) {
        await setActive!({ session: sessionId, navigate: goHome });
        return;
      }

      // Clerk can complete the sign-in server-side and still hand this flow back
      // a null createdSessionId — the browser-to-app handoff drops the id, but
      // the session is real and lands on the client a moment later. (The Clerk
      // dashboard shows `sign_in.completed` with strategy oauth_google at the
      // exact moment the old code was telling the user it had failed.) So look
      // for that session before concluding anything went wrong.
      if (await waitForRecoveredSession(clerk, goHome, priorSessionId)) {
        router.replace("/(tabs)");
        return;
      }

      // Nothing worked. Report the real cause: Clerk's error if one was thrown,
      // otherwise whatever the sign-up is still waiting for.
      const clerkDetail =
        (recoveryError as any)?.errors?.[0]?.longMessage ??
        (recoveryError as any)?.errors?.[0]?.message ??
        (recoveryError as Error | null)?.message ??
        null;

      const pending = [
        ...(latestSignUp?.missingFields ?? []),
        ...(latestSignUp?.unverifiedFields ?? []),
      ];

      const detail =
        clerkDetail ??
        (pending.length
          ? `Still needed: ${pending.join(", ")}.`
          : `Sign-up status: ${latestSignUp?.status ?? "none"}, sign-in status: ${signIn?.status ?? "none"}.`);

      Alert.alert(
        "Almost there",
        `Google sign-in could not be completed. ${detail} You can sign in with email and password instead.`
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
  }, [startSSOFlow, clerk, router]);

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
