import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

/**
 * "Use phone number", sitting alongside GoogleAuthButton on the email screens.
 *
 * It only navigates — the whole SMS flow lives on /(auth)/phone, because the
 * code step needs a screen of its own. Styled as a secondary button so the
 * email form stays the primary path for existing accounts.
 */
export function PhoneAuthButton({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      onPress={() => router.push("/(auth)/phone")}
      accessibilityRole="button"
      accessibilityLabel={
        mode === "sign-up" ? "Sign up with phone number" : "Sign in with phone number"
      }
    >
      <Feather name="smartphone" size={18} color="#1a1a1a" style={styles.icon} />
      <Text style={styles.buttonText}>Use phone number</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 12,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
