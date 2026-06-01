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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useUpdateProduct, useGetMyProducts, useGetUploadUrl } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function EditProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: products = [] } = useGetMyProducts();
  const updateProduct = useUpdateProduct();
  const getUploadUrl = useGetUploadUrl();

  const product = products.find((p) => p.id === productId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [materials, setMaterials] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? "");
      setPrice(product.price ?? "");
      setSize(product.size ?? "");
      setMaterials(product.materials ?? "");
      setImageUrl(product.imageUrl ?? null);
    }
  }, [product]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    setUploading(true);
    try {
      const filename = asset.uri.split("/").pop() ?? "image.jpg";
      const contentType = "image/jpeg";
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        uploadUrlInput: { filename, contentType },
      });
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": contentType } });
      setImageUrl(publicUrl);
    } catch {
      Alert.alert("Upload failed", "Could not upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Product name is required.");
      return;
    }
    setSaving(true);
    try {
      await updateProduct.mutateAsync({
        productId,
        updateProductInput: {
          name: name.trim(),
          description: description.trim() || null,
          price: price.trim() || null,
          size: size.trim() || null,
          materials: materials.trim() || null,
          imageUrl: imageUrl ?? null,
        },
      });
      router.replace("/(tabs)/my-business");
    } catch {
      Alert.alert("Error", "Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Product</Text>
        <Pressable onPress={handleSave} disabled={saving || uploading}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="camera" size={32} color={colors.primary} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.primary }]}>Add product photo</Text>
                </>
              )}
            </View>
          )}
          {imageUrl && !uploading && (
            <View style={styles.changeImageOverlay}>
              <Feather name="camera" size={16} color="#fff" />
              <Text style={styles.changeImageText}>Change</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Product Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Price (UGX)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 25000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this product..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Size</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={size}
            onChangeText={setSize}
            placeholder="e.g. S, M, L, XL"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Materials</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={materials}
            onChangeText={setMaterials}
            placeholder="e.g. 100% Cotton, Steel"
            placeholderTextColor={colors.mutedForeground}
          />

          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving || uploading ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving || uploading}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
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
  productImage: { width: "100%", height: 240, resizeMode: "cover" },
  imagePlaceholder: { width: "100%", height: 200, alignItems: "center", justifyContent: "center", gap: 10 },
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
  textArea: { height: 90, paddingTop: 13 },
  saveBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
