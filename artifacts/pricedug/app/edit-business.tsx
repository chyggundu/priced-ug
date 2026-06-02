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
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  useGetMyBusiness,
  useCreateBusiness,
  useUpdateMyBusiness,
  useGetCategories,
  useGetUploadUrl,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function EditBusinessScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: business, isLoading: bizLoading } = useGetMyBusiness();
  const { data: categories = [] } = useGetCategories();
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateMyBusiness();
  const getUploadUrl = useGetUploadUrl();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setDescription(business.description ?? "");
      setAddress(business.address ?? "");
      setCity(business.city ?? "");
      setPhone(business.phone ?? "");
      setCategoryId(business.categoryId ?? null);
      setImageUrl(business.imageUrl ?? null);
    }
  }, [business]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    setUploading(true);
    try {
      const filename = asset.uri.split("/").pop() ?? "image.jpg";
      const contentType = "image/jpeg";

      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        data: { filename, contentType },
      });

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": contentType } });

      setImageUrl(publicUrl);
    } catch (err) {
      Alert.alert("Upload failed", "Could not upload image. Please try again.");
    } finally {
      setUploading(false);
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
        categoryId: categoryId ?? null,
        imageUrl: imageUrl ?? null,
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

          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <Pressable
              style={[styles.categoryChip, { backgroundColor: categoryId === null ? colors.primary : colors.muted }]}
              onPress={() => setCategoryId(null)}
            >
              <Text style={[styles.categoryChipText, { color: categoryId === null ? "#fff" : colors.foreground }]}>
                None
              </Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.categoryChip, { backgroundColor: categoryId === cat.id ? colors.primary : colors.muted }]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[styles.categoryChipText, { color: categoryId === cat.id ? "#fff" : colors.foreground }]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

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
  categoryScroll: { marginBottom: 4 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryChipText: { fontSize: 14, fontWeight: "500" as const },
  saveBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
