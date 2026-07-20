import React, { useState } from "react";
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
import { pickImageAsset } from "@/lib/imagePicker";
import { uploadImageToSignedUrl, uploadErrorMessage } from "@/lib/uploadImage";
import { useCreateProduct, useGetUploadUrl, useGetCategories } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const CONDITION_OPTIONS = ["New", "Slightly Used", "Used"] as const;

export default function AddProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const createProduct = useCreateProduct();
  const getUploadUrl = useGetUploadUrl();
  const { data: categories = [] } = useGetCategories();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [materials, setMaterials] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState<string | null>(null);
  const [deliveredByPricedUg, setDeliveredByPricedUg] = useState(false);
  const [deliveredByBusiness, setDeliveredByBusiness] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const asset = await pickImageAsset([4, 3]);
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
      Alert.alert("Upload failed", uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Product name is required.");
      return;
    }
    if (categoryId == null) {
      Alert.alert("Validation", "Please choose a category for this item.");
      return;
    }
    setSaving(true);
    try {
      await createProduct.mutateAsync({
        data: {
          name: name.trim(),
          categoryId,
          description: description.trim() || null,
          price: price.trim() || null,
          size: size.trim() || null,
          materials: materials.trim() || null,
          color: color.trim() || null,
          condition: condition || null,
          imageUrl: imageUrl ?? null,
          deliveredByPricedUg,
          deliveredByBusiness,
        },
      });
      router.replace("/(tabs)/my-business");
    } catch {
      Alert.alert("Error", "Failed to add product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Product</Text>
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
            placeholder="e.g. Men's Cotton Shirt"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Category *</Text>
          <View style={styles.categoryWrap}>
            {categories.map((cat) => {
              const selected = categoryId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.categoryChip, { backgroundColor: selected ? colors.primary : colors.muted }]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  {selected && <Feather name="check" size={13} color="#fff" style={{ marginRight: 4 }} />}
                  <Text style={[styles.categoryChipText, { color: selected ? "#fff" : colors.foreground }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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
            placeholder="e.g. S, M, L, XL or 42x30"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Materials</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={materials}
            onChangeText={setMaterials}
            placeholder="e.g. 100% Cotton, Steel, Hardwood"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Color</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={color}
            onChangeText={setColor}
            placeholder="e.g. Black, Navy Blue, Red"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>Condition</Text>
          <View style={styles.conditionWrap}>
            {CONDITION_OPTIONS.map((opt) => {
              const selected = condition === opt;
              return (
                <Pressable
                  key={opt}
                  style={[styles.categoryChip, { backgroundColor: selected ? colors.primary : colors.muted }]}
                  onPress={() => setCondition(selected ? null : opt)}
                >
                  {selected && <Feather name="check" size={13} color="#fff" style={{ marginRight: 4 }} />}
                  <Text style={[styles.categoryChipText, { color: selected ? "#fff" : colors.foreground }]}>
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.deliveryToggle, { backgroundColor: colors.muted }]}
            onPress={() => setDeliveredByPricedUg((v) => !v)}
          >
            <View
              style={[
                styles.deliveryCheckbox,
                {
                  borderColor: deliveredByPricedUg ? colors.primary : colors.border,
                  backgroundColor: deliveredByPricedUg ? colors.primary : "transparent",
                },
              ]}
            >
              {deliveredByPricedUg && <Feather name="check" size={14} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.deliveryTitle, { color: colors.foreground }]}>Delivered through Priced Ug</Text>
              <Text style={[styles.deliverySubtitle, { color: colors.mutedForeground }]}>
                Tick if this item can be delivered via Priced Ug
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.deliveryToggle, { backgroundColor: colors.muted }]}
            onPress={() => setDeliveredByBusiness((v) => !v)}
          >
            <View
              style={[
                styles.deliveryCheckbox,
                {
                  borderColor: deliveredByBusiness ? colors.primary : colors.border,
                  backgroundColor: deliveredByBusiness ? colors.primary : "transparent",
                },
              ]}
            >
              {deliveredByBusiness && <Feather name="check" size={14} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.deliveryTitle, { color: colors.foreground }]}>Delivered by Business</Text>
              <Text style={[styles.deliverySubtitle, { color: colors.mutedForeground }]}>
                Tick if your business delivers this item
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving || uploading ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Add Product</Text>
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
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  conditionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: { fontSize: 14, fontWeight: "500" as const },
  saveBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
  deliveryToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },
  deliveryCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryTitle: { fontSize: 15, fontWeight: "600" as const },
  deliverySubtitle: { fontSize: 12, marginTop: 2 },
});
