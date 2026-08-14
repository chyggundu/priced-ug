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
import { pickImageAsset } from "@/lib/imagePicker";
import { pickVideoAsset } from "@/lib/videoPicker";
import { uploadImageToSignedUrl, uploadErrorMessage } from "@/lib/uploadImage";
import { useUpdateProduct, useGetMyProducts, useGetUploadUrl, useGetCategories } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { PRICE_TYPE_OPTIONS, type PriceType } from "@/lib/formatPrice";
import VideoModal from "@/components/VideoModal";

const CONDITION_OPTIONS = ["New", "Slightly Used", "Used"] as const;

export default function EditProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: products = [] } = useGetMyProducts();
  const { data: categories = [] } = useGetCategories();
  const updateProduct = useUpdateProduct();
  const getUploadUrl = useGetUploadUrl();

  const product = products.find((p) => p.id === productId);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("exact");
  const [size, setSize] = useState("");
  const [materials, setMaterials] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState<string | null>(null);
  const [deliveredByPricedUg, setDeliveredByPricedUg] = useState(false);
  const [deliveredByBusiness, setDeliveredByBusiness] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [previewingVideo, setPreviewingVideo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.categoryId ?? null);
      setDescription(product.description ?? "");
      setPrice(product.price ?? "");
      setPriceType((product.priceType as PriceType) ?? "exact");
      setSize(product.size ?? "");
      setMaterials(product.materials ?? "");
      setColor(product.color ?? "");
      setCondition(product.condition ?? null);
      setDeliveredByPricedUg(product.deliveredByPricedUg ?? false);
      setDeliveredByBusiness(product.deliveredByBusiness ?? false);
      setImageUrls(
        product.imageUrls && product.imageUrls.length > 0
          ? product.imageUrls
          : product.imageUrl
            ? [product.imageUrl]
            : []
      );
      setVideoUrl(product.videoUrl ?? null);
    }
  }, [product]);

  const pickImage = async () => {
    if (imageUrls.length >= 7) {
      Alert.alert("Photo limit", "You can add up to 7 photos per item.");
      return;
    }
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
      setImageUrls((prev) => (prev.length < 7 ? [...prev, publicUrl] : prev));
    } catch (err) {
      Alert.alert("Upload failed", uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const pickVideo = async () => {
    const asset = await pickVideoAsset();
    if (!asset) return;

    setUploadingVideo(true);
    try {
      const filename = asset.uri.split("/").pop() ?? "video.mp4";
      const contentType = asset.mimeType || "video/mp4";
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        data: { filename, contentType },
      });
      await uploadImageToSignedUrl(uploadUrl, asset.uri, contentType);
      setVideoUrl(publicUrl);
    } catch (err) {
      Alert.alert("Upload failed", uploadErrorMessage(err, "Could not upload video."));
    } finally {
      setUploadingVideo(false);
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
      await updateProduct.mutateAsync({
        productId,
        data: {
          name: name.trim(),
          categoryId,
          description: description.trim() || null,
          price: price.trim() || null,
          priceType,
          size: size.trim() || null,
          materials: materials.trim() || null,
          color: color.trim() || null,
          condition: condition || null,
          imageUrl: imageUrls[0] ?? null,
          imageUrls,
          videoUrl,
          deliveredByPricedUg,
          deliveredByBusiness,
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
        {imageUrls.length === 0 ? (
          <Pressable onPress={pickImage} style={styles.imagePicker}>
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="camera" size={32} color={colors.primary} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.primary }]}>
                    Add product photos (up to 7)
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        ) : (
          <View>
            <Image source={{ uri: imageUrls[0] }} style={styles.productImage} />
            <View style={styles.photoRow}>
              {imageUrls.map((url) => (
                <View key={url} style={styles.photoThumbWrap}>
                  <Image source={{ uri: url }} style={styles.photoThumb} />
                  <Pressable
                    style={styles.photoRemove}
                    onPress={() => removePhoto(url)}
                    hitSlop={8}
                  >
                    <Feather name="x" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {imageUrls.length < 7 && (
                <Pressable
                  style={[styles.photoAdd, { backgroundColor: colors.secondary }]}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Feather name="plus" size={22} color={colors.primary} />
                  )}
                </Pressable>
              )}
            </View>
            <Text style={[styles.photoHint, { color: colors.mutedForeground }]}>
              {imageUrls.length}/7 photos · first photo is the main one
            </Text>
          </View>
        )}

        <View style={styles.videoSection}>
          <Text style={[styles.label, { color: colors.foreground }]}>Video (optional)</Text>
          {videoUrl ? (
            <View style={styles.videoThumbWrap}>
              <Pressable
                style={[styles.videoThumb, { backgroundColor: colors.secondary }]}
                onPress={() => setPreviewingVideo(true)}
              >
                <Feather name="play-circle" size={26} color={colors.primary} />
                <Text style={[styles.videoThumbText, { color: colors.primary }]}>Preview</Text>
              </Pressable>
              <Pressable
                style={styles.photoRemove}
                onPress={() => setVideoUrl(null)}
                hitSlop={8}
              >
                <Feather name="x" size={14} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.videoAdd, { backgroundColor: colors.secondary }]}
              onPress={pickVideo}
              disabled={uploadingVideo}
            >
              {uploadingVideo ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="video" size={22} color={colors.primary} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.primary }]}>
                    Add a short video (up to 60s)
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Product Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={name}
            onChangeText={setName}
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

          <Text style={[styles.label, { color: colors.foreground }]}>Price Shown As</Text>
          <View style={styles.conditionWrap}>
            {PRICE_TYPE_OPTIONS.map((opt) => {
              const selected = priceType === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.categoryChip, { backgroundColor: selected ? colors.primary : colors.muted }]}
                  onPress={() => setPriceType(opt.value)}
                >
                  {selected && <Feather name="check" size={13} color="#fff" style={{ marginRight: 4 }} />}
                  <Text style={[styles.categoryChipText, { color: selected ? "#fff" : colors.foreground }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </Pressable>
        </View>

        <View style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 32 }} />
      </ScrollView>

      <VideoModal
        visible={previewingVideo}
        uri={videoUrl}
        onClose={() => setPreviewingVideo(false)}
      />
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
  imagePicker: { position: "relative" },
  productImage: { width: "100%", height: 240, resizeMode: "cover" },
  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  photoThumbWrap: { position: "relative" },
  photoThumb: { width: 64, height: 64, borderRadius: 8 },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoAdd: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  photoHint: { fontSize: 12, paddingHorizontal: 16, paddingTop: 8 },
  videoSection: { paddingHorizontal: 16, paddingTop: 12 },
  videoThumbWrap: { position: "relative", alignSelf: "flex-start" },
  videoThumb: {
    width: 120,
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  videoThumbText: { fontSize: 11, fontWeight: "600" as const },
  videoAdd: {
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
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
});
