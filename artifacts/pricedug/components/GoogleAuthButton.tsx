import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useClerk, useNativeSession, useSSO, useSignIn } from "@clerk/expo";
import { useSignInWithGoogle } from "@clerk/expo/google";
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
  // "Signed in" means the app can actually mint a token for the new session.
  // A session object alone is not enough: the browser can hand back one the
  // app's Clerk client cannot use, and reporting that as success drops the user
  // on a home screen where they are still signed out — worse than an error.
  const usable = async (): Promise<boolean> => {
    const session = clerk.session;
    if (!session || session.id === priorSessionId) return false;
    try {
      return Boolean(await session.getToken());
    } catch {
      return false;
    }
  };

  // Ask the server for the client instead of waiting for a background sync to
  // arrive on its own. This is what removes the visible pause: the session is
  // already created by the time the browser closes, so one fetch normally
  // settles it and the retries below never run.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await clerk.client?.reload();
    } catch {
      // Offline or mid-rotation; the checks below still get a chance.
    }

    if (await usable()) return true;

    const candidateId =
      clerk.client?.lastActiveSessionId ??
      (clerk.client?.sessions ?? []).find((s: any) => s.status === "active")?.id ??
      null;

    if (candidateId && candidateId !== priorSessionId) {
      try {
        await clerk.setActive({ session: candidateId, navigate: goHome });
        if (await usable()) return true;
      } catch {
        // Fall through; a later attempt may succeed.
      }
    }

    // Short backoff — only reached when the first fetch was too early.
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

export default function GoogleAuthButton() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  // Native Google auth (clerk-android / clerk-ios). It signs in through the
  // native SDK, so there is no in-app browser and no session handed back across
  // a redirect — which is the step that drops the session on this instance.
  // Available only once the @clerk/expo config plugin is prebuilt in; until then
  // `isAvailable` is false and the browser flow below runs exactly as before.
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { isAvailable: nativeAuthAvailable } = useNativeSession();
  const { signIn: currentSignIn } = useSignIn();
  const clerk = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Second-factor step: this instance emails a code on every sign-in, so an
  // existing account coming back through Google lands here rather than finishing
  // outright. A brand-new account takes the sign-up path and never sees this.
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const finishAfterCode = useCallback(async () => {
    setCodeError(null);
    setVerifying(true);
    try {
      const { error } = await currentSignIn.mfa.verifyEmailCode({ code });
      if (error) {
        setCodeError(error.longMessage ?? error.message ?? "That code didn't work.");
        return;
      }
      if (currentSignIn.status === "complete") {
        await currentSignIn.finalize();
        setCodeStep(false);
        setCode("");
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      setCodeError(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [currentSignIn, code, router]);

  const onPress = useCallback(async () => {
    setLoading(true);
    // Snapshot before the flow so recovery can tell a new session from an old one.
    const priorSessionId = clerk.session?.id ?? null;
    try {
      const result = nativeAuthAvailable
        ? await startGoogleAuthenticationFlow()
        : await startSSOFlow({
            strategy: "oauth_google",
            redirectUrl: AuthSession.makeRedirectUri(),
          });

      const { createdSessionId, setActive, signIn, signUp } = result;
      // Only the browser flow reports how the web session ended; the native flow
      // has no browser to dismiss.
      const authSessionResult =
        "authSessionResult" in result
          ? (result.authSessionResult as { type?: string } | null)
          : null;

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

      // An existing account signing back in needs the emailed code. The old code
      // ignored this status entirely, which is why a returning user always hit
      // the alert while a brand-new one sailed through.
      const needsCode =
        signIn?.status === "needs_second_factor" ||
        signIn?.status === "needs_client_trust" ||
        currentSignIn?.status === "needs_second_factor" ||
        currentSignIn?.status === "needs_client_trust";

      if (needsCode) {
        const { error: sendError } = await currentSignIn.mfa.sendEmailCode();
        if (sendError) {
          Alert.alert(
            "Couldn't send the code",
            sendError.longMessage ?? sendError.message ?? "Please try again.",
          );
          return;
        }
        setCodeStep(true);
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
  }, [startSSOFlow, startGoogleAuthenticationFlow, nativeAuthAvailable, clerk, currentSignIn, router]);

  if (codeStep) {
    return (
      <View style={styles.codeBox}>
        <Text style={styles.codeTitle}>Verify your account</Text>
        <Text style={styles.codeHint}>
          Enter the 6-digit code we emailed you to finish signing in with Google.
        </Text>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          placeholderTextColor="#999"
          keyboardType="numeric"
          autoFocus
        />
        {codeError && <Text style={styles.codeError}>{codeError}</Text>}
        <Pressable
          style={[styles.googleButton, styles.verifyButton, (!code || verifying) && styles.buttonDisabled]}
          onPress={finishAfterCode}
          disabled={!code || verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyText}>Verify</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => {
            setCodeStep(false);
            setCode("");
            setCodeError(null);
          }}
        >
          <Text style={styles.codeCancel}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

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
  codeBox: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  codeTitle: { fontSize: 16, fontWeight: "700" as const, color: "#1a1a1a" },
  codeHint: { fontSize: 13, color: "#888888" },
  codeInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1a1a",
  },
  codeError: { fontSize: 13, color: "#CC0020" },
  verifyButton: { backgroundColor: "#E01E37", borderColor: "#E01E37" },
  verifyText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" as const },
  codeCancel: { fontSize: 14, color: "#888888", textAlign: "center" as const },
  googleText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
