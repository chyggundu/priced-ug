import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn, useSignUp } from "@clerk/expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { formatForDisplay, isValidUgandanPhone, toE164 } from "@/lib/phone";

/** Seconds before "Resend code" becomes tappable again, matching Clerk's throttle. */
const RESEND_COOLDOWN = 30;

/**
 * Phone sign-in, the way TikTok does it: one number field, one SMS code, and no
 * separate "create account" step. Clerk keeps sign-in and sign-up as distinct
 * resources, so this screen decides between them itself — it tries to sign in,
 * and treats `form_identifier_not_found` as "this number is new" and registers
 * it instead. The user never has to know which of the two happened.
 */
export default function PhoneAuthScreen() {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  // Which Clerk resource owns this attempt. Decided when the code is sent, and
  // read again on verify — the two must not disagree.
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const busy = signInStatus === "fetching" || signUpStatus === "fetching";
  const e164 = toE164(phone);

  // One interval for the whole screen, cleared on unmount so a backgrounded
  // screen does not keep a timer alive.
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown > 0]);

  const finish = async (finalize: (opts: {
    navigate: (args: { decorateUrl: (url: string) => string }) => void;
  }) => Promise<unknown>) => {
    await finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/");
        if (url.startsWith("http")) return;
        router.replace("/(tabs)");
      },
    });
  };

  const sendCode = async () => {
    if (!e164) return;
    setError(null);

    const { error: signInError } = await signIn.phoneCode.sendCode({ phoneNumber: e164 });

    if (!signInError) {
      setMode("sign-in");
      setStep("code");
      setCooldown(RESEND_COOLDOWN);
      return;
    }

    /*
      Clerk returns this when no account carries the number. That is not a
      failure here — it is the signal to register instead. Any other code is a
      real error and gets shown.
    */
    if (signInError.code !== "form_identifier_not_found") {
      setError(signInError.longMessage ?? signInError.message ?? "Couldn't send the code.");
      return;
    }

    const { error: createError } = await signUp.create({ phoneNumber: e164 });
    if (createError) {
      setError(createError.longMessage ?? createError.message ?? "Couldn't create the account.");
      return;
    }

    const { error: sendError } = await signUp.verifications.sendPhoneCode();
    if (sendError) {
      setError(sendError.longMessage ?? sendError.message ?? "Couldn't send the code.");
      return;
    }

    setMode("sign-up");
    setStep("code");
    setCooldown(RESEND_COOLDOWN);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    const { error: resendError } =
      mode === "sign-in"
        ? await signIn.phoneCode.sendCode()
        : await signUp.verifications.sendPhoneCode();
    if (resendError) {
      setError(resendError.longMessage ?? resendError.message ?? "Couldn't resend the code.");
      return;
    }
    setCooldown(RESEND_COOLDOWN);
  };

  const verify = async () => {
    setError(null);

    if (mode === "sign-in") {
      const { error: verifyError } = await signIn.phoneCode.verifyCode({ code });
      if (verifyError) {
        setError(verifyError.longMessage ?? verifyError.message ?? "That code didn't work.");
        return;
      }
      if (signIn.status === "complete") await finish(signIn.finalize);
      return;
    }

    const { error: verifyError } = await signUp.verifications.verifyPhoneCode({ code });
    if (verifyError) {
      setError(verifyError.longMessage ?? verifyError.message ?? "That code didn't work.");
      return;
    }
    if (signUp.status === "complete") await finish(signUp.finalize);
  };

  if (step === "code") {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Pressable
          style={styles.backRow}
          onPress={() => {
            setStep("phone");
            setCode("");
            setError(null);
          }}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={20} color="#1a1a1a" />
        </Pressable>

        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to {formatForDisplay(phone)}</Text>

        <TextInput
          style={[styles.input, styles.codeInput]}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^\d]/g, "").slice(0, 6))}
          placeholder="------"
          placeholderTextColor="#CCCCCC"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          autoFocus
          maxLength={6}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, (code.length !== 6 || busy) && styles.buttonDisabled]}
          onPress={verify}
          disabled={code.length !== 6 || busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </Pressable>

        <Pressable onPress={resend} disabled={cooldown > 0}>
          <Text style={[styles.link, cooldown > 0 && styles.linkDisabled]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </Text>
        </Pressable>

        {/* Clerk's bot check needs somewhere to mount when the number is new. */}
        <View nativeID="clerk-captcha" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.appName}>Priced Ug</Text>
          <Text style={styles.tagline}>Find the best deals in Uganda</Text>
        </View>

        <Text style={styles.title}>Continue with phone</Text>
        <Text style={styles.subtitle}>
          We&apos;ll text you a code. No password needed.
        </Text>

        <View style={styles.phoneWrapper}>
          <Text style={styles.prefix}>+256</Text>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="772 123 456"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            autoFocus
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[
            styles.button,
            (!isValidUgandanPhone(phone) || busy) && styles.buttonDisabled,
          ]}
          onPress={sendCode}
          disabled={!isValidUgandanPhone(phone) || busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send code</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Prefer email? </Text>
          <Link href="/(auth)/sign-in">
            <Text style={styles.link}>Sign in</Text>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },
  backRow: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E01E37",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
  appName: {
    fontSize: 26,
    fontWeight: "bold" as const,
    color: "#E01E37",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#888888",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 12,
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
  },
  phoneWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 12,
  },
  prefix: {
    paddingLeft: 16,
    paddingRight: 8,
    fontSize: 16,
    color: "#555555",
    fontWeight: "600" as const,
  },
  phoneInput: {
    flex: 1,
    paddingRight: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
  },
  button: {
    backgroundColor: "#E01E37",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  error: {
    color: "#CC0020",
    fontSize: 13,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    color: "#888888",
    fontSize: 14,
  },
  link: {
    color: "#E01E37",
    fontSize: 14,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  linkDisabled: {
    color: "#BBBBBB",
  },
});
