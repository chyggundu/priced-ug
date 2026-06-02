import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;
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

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code: verifyCode });
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

  if (signIn.status === "needs_client_trust") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.title}>Verify your account</Text>
        <TextInput
          style={styles.input}
          value={verifyCode}
          onChangeText={setVerifyCode}
          placeholder="Verification code"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
        {errors.fields.code && <Text style={styles.error}>{errors.fields.code.message}</Text>}
        <Pressable style={[styles.button, fetchStatus === "fetching" && styles.buttonDisabled]} onPress={handleVerify} disabled={fetchStatus === "fetching"}>
          {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
        </Pressable>
        <Pressable onPress={() => signIn.mfa.sendEmailCode()}>
          <Text style={styles.link}>Resend code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.appName}>Priced Ug</Text>
          <Text style={styles.tagline}>Find the best deals in Uganda</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>

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

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
        />
        {errors.fields.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}

        <Pressable
          style={[styles.button, (!email || !password || fetchStatus === "fetching") && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!email || !password || fetchStatus === "fetching"}
        >
          {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={styles.link}>Sign up</Text>
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
});
