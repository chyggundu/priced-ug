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
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { ProductMediaEditor } from "@/components/ProductMediaEditor";
import { useCategories, useMyBusiness } from "@/lib/queries";
import { useCreateProduct } from "@/lib/mutations";
import { useColors } from "@/hooks/useColors";
import { PRICE_TYPE_OPTIONS } from "@/constants/product";
import {
  ProductAttributeFields,
  type ProductAttributes,
} from "@/components/ProductAttributeFields";

export default function AddProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { userId } = useAuth();
  // The API derived the owner's business from the session; PostgREST needs it
  // named explicitly on the insert.
  const { data: business } = useMyBusiness(userId);
  const createProduct = useCreateProduct();
  const { data: categories = [] } = useCategories();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [materials, setMaterials] = useState("");
  const [priceType, setPriceType] = useState<string>("exact");
  const [attributes, setAttributes] = useState<ProductAttributes>({
    color: "",
    condition: "",
    deliveredByBusiness: false,
    deliveredByPricedUg: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      if (!business) {
        Alert.alert("No business", "Create your business page before adding items.");
        return;
      }
      await createProduct.mutateAsync({
        businessId: business.id,
        input: {
          name: name.trim(),
          categoryId,
          description: description.trim() || null,
          price: price.trim() || null,
          priceType,
          color: attributes.color.trim() || null,
          condition: attributes.condition || null,
          deliveredByBusiness: attributes.deliveredByBusiness,
          deliveredByPricedUg: attributes.deliveredByPricedUg,
          size: size.trim() || null,
          materials: materials.trim() || null,
          // The first gallery photo stays the cover, which is the only image
          // the browse and business lists read.
          imageUrl: imageUrls[0] ?? null,
          imageUrls,
          videoUrl,
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
        <ProductMediaEditor
          imageUrls={imageUrls}
          onChangeImageUrls={setImageUrls}
          videoUrl={videoUrl}
          onChangeVideoUrl={setVideoUrl}
          onBusyChange={setUploading}
        />

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

          <Text style={[styles.label, { color: colors.foreground }]}>Price type</Text>
          <View style={styles.categoryWrap}>
            {PRICE_TYPE_OPTIONS.map((option) => {
              const selected = priceType === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.categoryChip, { backgroundColor: selected ? colors.primary : colors.muted }]}
                  onPress={() => setPriceType(option.value)}
                >
                  <Text style={[styles.categoryChipText, { color: selected ? "#fff" : colors.foreground }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Price</Text>
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

          <ProductAttributeFields value={attributes} onChange={setAttributes} />

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
  form: { padding: 16, gap: 4 },
  label: { fontSize: 14, fontWeight: "600" as const, marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  textArea: { height: 90, paddingTop: 13 },
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
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
});
