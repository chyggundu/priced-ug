import React, { useState } from "react";
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
import { useSignIn } from "@clerk/expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "request" | "verify" | "reset";

export default function ForgotPasswordScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const busy = fetchStatus === "fetching";
  const globalMsg = (errors.global?.[0] as { message?: string } | undefined)?.message;

  const handleSendCode = async () => {
    const created = await signIn.create({ identifier: email });
    if (created.error) return;
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) return;
    setStep("verify");
  };

  const handleVerify = async () => {
    const res = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (res.error) return;
    if (signIn.status === "needs_new_password") setStep("reset");
  };

  const handleReset = async () => {
    const res = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
    if (res.error) return;
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) return;
          router.replace("/(tabs)");
        },
      });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.appName}>Priced Ug</Text>
          <Text style={styles.tagline}>Reset your password</Text>
        </View>

        {step === "request" && (
          <>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter the email you signed up with and we'll send you a reset code.
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.fields.identifier && <Text style={styles.error}>{errors.fields.identifier.message}</Text>}
            {globalMsg && <Text style={styles.error}>{globalMsg}</Text>}
            <Pressable
              style={[styles.button, (!email || busy) && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={!email || busy}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset code</Text>}
            </Pressable>
          </>
        )}

        {step === "verify" && (
          <>
            <Text style={styles.title}>Enter reset code</Text>
            <Text style={styles.subtitle}>We sent a code to {email}. Enter it below.</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.fields.code && <Text style={styles.error}>{errors.fields.code.message}</Text>}
            {globalMsg && <Text style={styles.error}>{globalMsg}</Text>}
            <Pressable
              style={[styles.button, (!code || busy) && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={!code || busy}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify code</Text>}
            </Pressable>
            <Pressable onPress={handleSendCode} disabled={busy}>
              <Text style={[styles.link, styles.centerLink]}>Resend code</Text>
            </Pressable>
          </>
        )}

        {step === "reset" && (
          <>
            <Text style={styles.title}>Set a new password</Text>
            <Text style={styles.subtitle}>Choose a new password for {email}.</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              placeholderTextColor="#999"
              autoCapitalize="none"
              secureTextEntry
            />
            {errors.fields.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}
            {globalMsg && <Text style={styles.error}>{globalMsg}</Text>}
            <Pressable
              style={[styles.button, (!newPassword || busy) && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={!newPassword || busy}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset password</Text>}
            </Pressable>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <Link href="/(auth)/sign-in">
            <Text style={styles.link}>Sign in</Text>
          </Link>
        </View>
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
  },
  centerLink: {
    textAlign: "center",
    marginBottom: 8,
  },
});
