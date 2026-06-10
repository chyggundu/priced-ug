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
  Image,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pickImageAsset } from "@/lib/imagePicker";
import * as Location from "expo-location";
import { uploadImageToSignedUrl } from "@/lib/uploadImage";
import MapPicker from "@/components/MapPicker";
import {
  useGetMyBusiness,
  useCreateBusiness,
  useUpdateMyBusiness,
  useGetUploadUrl,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function EditBusinessScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: business, isLoading: bizLoading } = useGetMyBusiness();
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateMyBusiness();
  const getUploadUrl = useGetUploadUrl();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setDescription(business.description ?? "");
      setAddress(business.address ?? "");
      setCity(business.city ?? "");
      setPhone(business.phone ?? "");
      setImageUrl(business.imageUrl ?? null);
      setLatitude(business.latitude ?? null);
      setLongitude(business.longitude ?? null);
    }
  }, [business]);

  const pickImage = async () => {
    const asset = await pickImageAsset([16, 9]);
    if (!asset) return;

    setUploading(true);
    try {
      const filename = asset.uri.split("/").pop() ?? "image.jpg";
      const contentType = "image/jpeg";

      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        data: { filename, contentType },
      });

      await uploadImageToSignedUrl(uploadUrl, asset.uri, contentType);

      setImageUrl(publicUrl);
    } catch (err) {
      Alert.alert("Upload failed", "Could not upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const pinLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Location permission is required to pin your business location."
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(pos.coords.latitude);
      setLongitude(pos.coords.longitude);
    } catch (err) {
      Alert.alert("Location error", "Could not get your current location. Please try again.");
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Business name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        phone: phone.trim() || null,
        imageUrl: imageUrl ?? null,
        latitude,
        longitude,
      };

      if (business) {
        await updateBusiness.mutateAsync({ data: payload });
      } else {
        await createBusiness.mutateAsync({ data: payload });
      }

      router.replace("/(tabs)/my-business");
    } catch (err) {
      Alert.alert("Error", "Failed to save business. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (bizLoading) {
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {business ? "Edit Business" : "Create Business"}
        </Text>
        <Pressable onPress={handleSave} disabled={saving || uploading}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Business Image */}
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="image" size={32} color={colors.primary} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.primary }]}>
                    Add business photo
                  </Text>
                </>
              )}
            </View>
          )}
          {imageUrl && !uploading && (
            <View style={styles.changeImageOverlay}>
              <Feather name="camera" size={18} color="#fff" />
              <Text style={styles.changeImageText}>Change photo</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Business Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Kampala Fashion House"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
            Your business appears under the categories of the items you list.
          </Text>

          <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your business and what you offer..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: colors.foreground }]}>City / Town</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Kampala"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Nakasero Market"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Map Location</Text>
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
                  {latitude != null && longitude != null
                    ? "Update pinned location"
                    : "Pin current location"}
                </Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[styles.locationBtn, { backgroundColor: colors.muted, borderColor: colors.border, marginTop: 8 }]}
            onPress={() => setShowMap(true)}
          >
            <Feather name="map" size={18} color={colors.primary} />
            <Text style={[styles.locationBtnText, { color: colors.foreground }]}>
              Choose exact spot on map
            </Text>
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

          <Text style={[styles.label, { color: colors.foreground }]}>Phone / WhatsApp Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +256700000000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />

          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving || uploading ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>
                {business ? "Save Changes" : "Create Business Page"}
              </Text>
            )}
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
  center: { alignItems: "center", justifyContent: "center" },
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
  imagePicker: { position: "relative" },
  bannerImage: { width: "100%", height: 200, resizeMode: "cover" },
  imagePlaceholder: { width: "100%", height: 200, alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontSize: 14, fontWeight: "500" as const },
  changeImageOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeImageText: { color: "#fff", fontSize: 12 },
  form: { padding: 16, gap: 4 },
  label: { fontSize: 14, fontWeight: "600" as const, marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  textArea: { height: 100, paddingTop: 13 },
  helperText: { fontSize: 12, marginBottom: 8, marginTop: 4 },
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
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  locationCoords: { fontSize: 13 },
  locationClear: { fontSize: 13, fontWeight: "600" as const },
  saveBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
