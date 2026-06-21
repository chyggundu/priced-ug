import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import * as Location from "expo-location";
import MapPicker from "@/components/MapPicker";
import {
  useGetMyCustomerProfile,
  useSaveMyCustomerProfile,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function CustomerProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { isSignedIn } = useAuth();

  const { data: profile, isLoading } = useGetMyCustomerProfile({
    query: { enabled: !!isSignedIn, retry: false },
  });
  const saveProfile = useSaveMyCustomerProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [village, setVillage] = useState("");
  const [street, setStreet] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone);
      setDistrict(profile.district);
      setTown(profile.town ?? "");
      setVillage(profile.village ?? "");
      setStreet(profile.street ?? "");
      setLatitude(profile.latitude ?? null);
      setLongitude(profile.longitude ?? null);
    }
  }, [profile]);

  const pinLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location permission is required to pin your location.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(pos.coords.latitude);
      setLongitude(pos.coords.longitude);
    } catch {
      Alert.alert("Location error", "Could not get your current location. Please try again.");
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !district.trim()) {
      Alert.alert("Validation", "Full name, phone number, and district are required.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile.mutateAsync({
        data: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          district: district.trim(),
          town: town.trim() || null,
          village: village.trim() || null,
          street: street.trim() || null,
          latitude,
          longitude,
        },
      });
      Alert.alert("Saved", "Your profile has been saved.");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={48} color={colors.mutedForeground} />
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>Sign in required</Text>
        <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(auth)/sign-in")}>
          <Text style={styles.saveBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Profile</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>
            Save your contact and delivery details so businesses you buy from can reach you.
          </Text>

          <Text style={[styles.label, { color: colors.foreground }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Sarah Nakato"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Phone / WhatsApp Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +256700000000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: colors.foreground }]}>District *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={district}
            onChangeText={setDistrict}
            placeholder="e.g. Kampala"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Town</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={town}
            onChangeText={setTown}
            placeholder="e.g. Nakawa"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Village</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={village}
            onChangeText={setVillage}
            placeholder="e.g. Kyambogo"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Street / Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={street}
            onChangeText={setStreet}
            placeholder="e.g. Plot 5, Banda Road"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Map Location (optional)</Text>
          <Pressable
            style={[styles.locationBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={pinLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Feather name="map-pin" size={18} color={colors.primary} />
                <Text style={[styles.locationBtnText, { color: colors.foreground }]}>
                  {latitude != null && longitude != null ? "Update pinned location" : "Pin current location"}
                </Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[styles.locationBtn, { backgroundColor: colors.muted, borderColor: colors.border, marginTop: 8 }]}
            onPress={() => setShowMap(true)}
          >
            <Feather name="map" size={18} color={colors.primary} />
            <Text style={[styles.locationBtnText, { color: colors.foreground }]}>Choose exact spot on map</Text>
          </Pressable>
          {latitude != null && longitude != null && (
            <View style={styles.locationInfo}>
              <Text style={[styles.locationCoords, { color: colors.mutedForeground }]}>
                Pinned: {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </Text>
              <Pressable
                onPress={() => {
                  setLatitude(null);
                  setLongitude(null);
                }}
              >
                <Text style={[styles.locationClear, { color: colors.primary }]}>Remove</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1, marginTop: 24 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
          </Pressable>
        </View>

        <View style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 32 }} />
      </ScrollView>

      {showMap && (
        <Modal visible animationType="slide" onRequestClose={() => setShowMap(false)}>
          <MapPicker
            initialLat={latitude}
            initialLng={longitude}
            onCancel={() => setShowMap(false)}
            onConfirm={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
              setShowMap(false);
            }}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  centerTitle: { fontSize: 20, fontWeight: "700" as const, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600" as const, textAlign: "center" },
  saveText: { fontSize: 16, fontWeight: "600" as const },
  content: { flex: 1 },
  form: { padding: 16, gap: 4 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600" as const, marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 13,
  },
  locationBtnText: { fontSize: 15, fontWeight: "500" as const },
  locationInfo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  locationCoords: { fontSize: 13 },
  locationClear: { fontSize: 13, fontWeight: "600" as const },
  saveBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
