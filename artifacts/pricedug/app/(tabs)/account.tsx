import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useGetMyBusiness } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAppAuth } from "@/context/AuthContext";

const WHATSAPP_NUMBER = "1234567890";

export default function AccountScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { isAdmin } = useAppAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: business } = useGetMyBusiness({ query: { enabled: !!isSignedIn && !isAdmin, retry: false } });
  const canAccessCustomers = isAdmin || !!business;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const openWhatsApp = () => {
    const { Linking } = require("react-native");
    Linking.openURL(`whatsapp://send?phone=${WHATSAPP_NUMBER}&text=Hi, I need help with Priced Ug.`)
      .catch(() => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`));
  };

  if (!isSignedIn) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="user-circle" size={64} color={colors.mutedForeground} />
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>Not signed in</Text>
        <Text style={[styles.centerSubtitle, { color: colors.mutedForeground }]}>
          Sign in to manage your business page
        </Text>
        <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(auth)/sign-in")}>
          <Text style={styles.btnText}>Sign In</Text>
        </Pressable>
        <Pressable style={[styles.outlineBtn, { borderColor: colors.primary }]} onPress={() => router.push("/(auth)/sign-up")}>
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Create Account</Text>
        </Pressable>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <Pressable style={styles.contactRow} onPress={openWhatsApp}>
          <Feather name="message-circle" size={20} color="#25D366" />
          <Text style={[styles.contactText, { color: colors.foreground }]}>Contact us on WhatsApp</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {(user?.emailAddresses[0]?.emailAddress ?? "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {user?.fullName ?? user?.emailAddresses[0]?.emailAddress ?? "Business Owner"}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.menuItem} onPress={() => router.push("/(tabs)/my-business")}>
            <Feather name="briefcase" size={18} color={colors.primary} />
            <Text style={[styles.menuItemText, { color: colors.foreground }]}>My Business</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.menuItem} onPress={() => router.push("/customer-profile")}>
            <Feather name="user" size={18} color={colors.primary} />
            <Text style={[styles.menuItemText, { color: colors.foreground }]}>My Profile</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>

          {canAccessCustomers && (
            <>
              <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
              <Pressable style={styles.menuItem} onPress={() => router.push("/access-customer")}>
                <Feather name="search" size={18} color={colors.primary} />
                <Text style={[styles.menuItemText, { color: colors.foreground }]}>Access Customer</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            </>
          )}

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.menuItem} onPress={openWhatsApp}>
            <Feather name="message-circle" size={18} color="#25D366" />
            <Text style={[styles.menuItemText, { color: colors.foreground }]}>Contact Support on WhatsApp</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable style={[styles.signOutBtn, { borderColor: colors.destructive }]} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>

        <View style={{ height: Platform.OS === "web" ? 100 : insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  centerTitle: { fontSize: 20, fontWeight: "700" as const, textAlign: "center" },
  centerSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, marginTop: 4, width: "100%" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const, textAlign: "center" },
  outlineBtn: { paddingHorizontal: 32, paddingVertical: 13, borderRadius: 10, borderWidth: 1.5, width: "100%" },
  outlineBtnText: { fontSize: 16, fontWeight: "600" as const, textAlign: "center" },
  separator: { width: "100%", height: 1, marginVertical: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  contactText: { flex: 1, fontSize: 15 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" as const },
  content: { flex: 1 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" as const },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "600" as const, marginBottom: 2 },
  profileEmail: { fontSize: 13 },
  menuCard: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
  menuItemText: { flex: 1, fontSize: 15 },
  menuDivider: { height: 1, marginLeft: 16 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  signOutText: { fontSize: 15, fontWeight: "600" as const },
});
