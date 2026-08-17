import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  Modal,
  Dimensions,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetBusiness,
  useGetBusinessProducts,
  useAdminDeleteProduct,
  useDeleteProduct,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAppAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { recordBusinessView } from "@/lib/recentlyViewed";
import { BusinessReviews } from "@/components/BusinessReviews";
import { formatPrice } from "@/lib/formatPrice";
import LocationMap from "@/components/LocationMap";
import VideoModal from "@/components/VideoModal";

export default function BusinessDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, highlight } = useLocalSearchParams<{ id: string; highlight?: string }>();
  const businessId = parseInt(id ?? "0");
  const highlightId = highlight ? parseInt(highlight) : null;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { isAdmin, userId } = useAppAuth();
  const [viewerImages, setViewerImages] = useState<string[] | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const windowWidth = Dimensions.get("window").width;

  const openViewer = (product: { imageUrls?: string[]; imageUrl?: string | null }) => {
    const photos =
      product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : [];
    if (photos.length === 0) return;
    setViewerIndex(0);
    setViewerImages(photos);
  };

  const { data: business, isLoading: bizLoading, error: bizError, refetch: refetchBusiness } =
    useGetBusiness(businessId, { query: { enabled: Number.isFinite(businessId) && businessId > 0 } });
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } =
    useGetBusinessProducts(businessId, {
      query: { enabled: !!business },
    });

  const { isSignedIn, isBusinessFavorite, isProductFavorite, toggleBusiness, toggleProduct } =
    useFavorites();

  useEffect(() => {
    if (business) {
      recordBusinessView({
        id: business.id,
        name: business.name,
        imageUrl: business.imageUrl,
        city: business.city,
      });
    }
  }, [business]);

  const requireSignIn = (action: () => void) => {
    if (!isSignedIn) {
      router.push("/(auth)/sign-in");
      return;
    }
    action();
  };

  const shareBusiness = () => {
    if (!business) return;
    const parts = [
      `${business.name} on Priced Ug`,
      business.description ? business.description : null,
      business.city ? `Location: ${business.city}` : null,
      business.phone ? `Contact: ${business.phone}` : null,
      "Find them on the Priced Ug app!",
    ].filter(Boolean);
    Share.share({ message: parts.join("\n") }).catch(() => {});
  };

  const shareProduct = (product: { name: string; price?: string | null; priceType?: string | null }) => {
    if (!business) return;
    const priceText = formatPrice(product.price, product.priceType);
    const parts = [
      `${product.name}${priceText ? ` – ${priceText}` : ""}`,
      `Available at ${business.name} on Priced Ug`,
      business.phone ? `Contact: ${business.phone}` : null,
      "Find it on the Priced Ug app!",
    ].filter(Boolean);
    Share.share({ message: parts.join("\n") }).catch(() => {});
  };

  const isOwner = !!userId && business?.clerkUserId === userId;
  const canDelete = isAdmin || isOwner;

  const adminDeleteProduct = useAdminDeleteProduct();
  const ownerDeleteProduct = useDeleteProduct();
  const isDeleting = adminDeleteProduct.isPending || ownerDeleteProduct.isPending;

  const handleDeleteProduct = (productId: number, productName: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (isAdmin) {
                await adminDeleteProduct.mutateAsync({ productId });
              } else {
                await ownerDeleteProduct.mutateAsync({ productId });
              }
              refetchProducts();
            } catch {
              Alert.alert("Delete failed", "Could not delete this product. Please try again.");
            }
          },
        },
      ]
    );
  };

  const orderedProducts = React.useMemo(() => {
    if (highlightId == null) return products;
    const idx = products.findIndex((p) => p.id === highlightId);
    if (idx <= 0) return products;
    return [products[idx], ...products.slice(0, idx), ...products.slice(idx + 1)];
  }, [products, highlightId]);

  const openWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    Linking.openURL(`whatsapp://send?phone=${digits}`)
      .catch(() => Linking.openURL(`https://wa.me/${digits}`));
  };

  const openDirections = (lat: number, lng: number) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };

  if (bizLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!business) {
    // A 404 means the business really is gone; anything else (network, auth)
    // is a load failure the user can retry — don't claim it doesn't exist.
    const isMissing = !bizError || bizError.status === 404;
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
          {isMissing ? "Business not found" : "Couldn't load this business"}
        </Text>
        {!isMissing && (
          <Text style={[styles.centerText, { color: colors.mutedForeground, fontSize: 13 }]}>
            {bizError.message}
          </Text>
        )}
        <Pressable onPress={() => (isMissing ? router.back() : refetchBusiness())}>
          <Text style={[styles.backLink, { color: colors.primary }]}>
            {isMissing ? "Go back" : "Try again"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {business.name}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.headerIconBtn}
            hitSlop={4}
          >
            <Feather name="home" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => requireSignIn(() => toggleBusiness(business.id))}
            style={styles.headerIconBtn}
            hitSlop={4}
          >
            <Feather
              name="heart"
              size={20}
              color={isBusinessFavorite(business.id) ? colors.primary : colors.mutedForeground}
            />
          </Pressable>
          <Pressable onPress={shareBusiness} style={styles.headerIconBtn} hitSlop={4}>
            <Feather name="share-2" size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Banner */}
        {business.imageUrl ? (
          <Image source={{ uri: business.imageUrl }} style={styles.banner} />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: colors.secondary }]}>
            <Feather name="briefcase" size={48} color={colors.primary} />
          </View>
        )}

        {/* Business Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.businessName, { color: colors.foreground }]}>{business.name}</Text>

          {business.categories && business.categories.length > 0 && (
            <View style={styles.categoryRow}>
              {business.categories.map((cat) => (
                <View key={cat.id} style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>{cat.name}</Text>
                </View>
              ))}
            </View>
          )}

          {business.description && (
            <Text style={[styles.description, { color: colors.foreground }]}>
              {business.description}
            </Text>
          )}

          <View style={styles.detailsCard}>
            {business.address && (
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={16} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.foreground }]}>{business.address}</Text>
              </View>
            )}
            {business.latitude != null && business.longitude != null && (
              <>
                {business.address && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
                <Pressable
                  style={styles.detailRow}
                  onPress={() => openDirections(business.latitude!, business.longitude!)}
                >
                  <Feather name="navigation" size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.primary }]}>Get Directions</Text>
                </Pressable>
                <View style={{ marginTop: 12 }}>
                  <LocationMap
                    latitude={business.latitude}
                    longitude={business.longitude}
                    height={220}
                    label="Open in Google Maps"
                  />
                </View>
              </>
            )}
            {(business.openingTime || business.closingTime) && (
              <>
                {(business.address || (business.latitude != null && business.longitude != null)) && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
                <View style={styles.detailRow}>
                  <Feather name="clock" size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>
                    {business.openingTime && business.closingTime
                      ? `Open ${business.openingTime} – ${business.closingTime}`
                      : business.openingTime
                        ? `Opens at ${business.openingTime}`
                        : `Closes at ${business.closingTime}`}
                  </Text>
                </View>
              </>
            )}
            {business.phone && (
              <>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <Pressable style={styles.detailRow} onPress={() => openWhatsApp(business.phone!)}>
                  <Feather name="phone" size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.primary }]}>{business.phone}</Text>
                </Pressable>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <Pressable style={styles.detailRow} onPress={() => openWhatsApp(business.phone!)}>
                  <Feather name="message-circle" size={16} color="#25D366" />
                  <Text style={[styles.detailText, { color: "#25D366" }]}>Contact on WhatsApp</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Products & Merchandise
          </Text>

          {productsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : products.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Feather name="package" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No products listed yet
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {orderedProducts.map((product) => (
                <View
                  key={product.id}
                  style={[
                    styles.productCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    product.id === highlightId && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  {product.imageUrl ? (
                    <Pressable onPress={() => openViewer(product)}>
                      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                      {(product.imageUrls?.length ?? 0) > 1 && (
                        <View style={styles.photoCountBadge}>
                          <Feather name="image" size={11} color="#fff" />
                          <Text style={styles.photoCountText}>{product.imageUrls!.length}</Text>
                        </View>
                      )}
                    </Pressable>
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Feather name="image" size={24} color={colors.primary} />
                    </View>
                  )}
                  {product.videoUrl && (
                    <Pressable
                      style={styles.videoPlayBadge}
                      onPress={() => setPlayingVideoUrl(product.videoUrl!)}
                      hitSlop={8}
                    >
                      <Feather name="play-circle" size={16} color="#fff" />
                      <Text style={styles.photoCountText}>Video</Text>
                    </Pressable>
                  )}
                  {canDelete && (
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteProduct(product.id, product.name)}
                      disabled={isDeleting}
                      hitSlop={8}
                    >
                      <Feather name="trash-2" size={16} color="#fff" />
                    </Pressable>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View style={styles.badgeRow}>
                      {product.categoryName && (
                        <View style={[styles.productCategoryBadge, { backgroundColor: colors.secondary }]}>
                          <Text style={[styles.productCategoryText, { color: colors.primary }]}>
                            {product.categoryName}
                          </Text>
                        </View>
                      )}
                      {product.condition && (
                        <View style={[styles.conditionBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.conditionBadgeText}>{product.condition}</Text>
                        </View>
                      )}
                    </View>
                    {product.price && (
                      <Text style={[styles.productPrice, { color: colors.primary }]}>
                        {formatPrice(product.price, product.priceType)}
                      </Text>
                    )}
                    {product.deliveredByPricedUg && (
                      <View style={[styles.deliveryBadge, { backgroundColor: colors.secondary }]}>
                        <Feather name="truck" size={12} color={colors.primary} />
                        <Text style={[styles.deliveryBadgeText, { color: colors.primary }]}>
                          Delivered via Priced Ug
                        </Text>
                      </View>
                    )}
                    {product.deliveredByBusiness && (
                      <View style={[styles.deliveryBadge, { backgroundColor: colors.secondary }]}>
                        <Feather name="truck" size={12} color={colors.primary} />
                        <Text style={[styles.deliveryBadgeText, { color: colors.primary }]}>
                          Delivered by Business
                        </Text>
                      </View>
                    )}
                    {product.description && (
                      <Text style={[styles.productDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    {(product.size || product.materials || product.color) && (
                      <View style={styles.tagRow}>
                        {product.size && (
                          <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                              Size: {product.size}
                            </Text>
                          </View>
                        )}
                        {product.color && (
                          <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                              Color: {product.color}
                            </Text>
                          </View>
                        )}
                        {product.materials && (
                          <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                              {product.materials}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    <View style={styles.productActions}>
                      {business.phone && (
                        <Pressable
                          style={[styles.inquireBtn, { backgroundColor: "#25D366" }]}
                          onPress={() => openWhatsApp(business.phone!)}
                        >
                          <Feather name="message-circle" size={13} color="#fff" />
                          <Text style={styles.inquireBtnText}>Inquire</Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={[styles.productActionBtn, { borderColor: colors.border }]}
                        onPress={() => requireSignIn(() => toggleProduct(product.id))}
                        hitSlop={4}
                      >
                        <Feather
                          name="heart"
                          size={15}
                          color={isProductFavorite(product.id) ? colors.primary : colors.mutedForeground}
                        />
                      </Pressable>
                      <Pressable
                        style={[styles.productActionBtn, { borderColor: colors.border }]}
                        onPress={() => shareProduct(product)}
                        hitSlop={4}
                      >
                        <Feather name="share-2" size={15} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <BusinessReviews businessId={businessId} ownerUserId={business.clerkUserId} />

        <View style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 32 }} />
      </ScrollView>

      <Modal
        visible={!!viewerImages}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerImages(null)}
      >
        <View style={styles.viewerOverlay}>
          {viewerImages && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setViewerIndex(Math.round(e.nativeEvent.contentOffset.x / windowWidth))
              }
            >
              {viewerImages.map((url) => (
                <Pressable
                  key={url}
                  style={{ width: windowWidth, justifyContent: "center" }}
                  onPress={() => setViewerImages(null)}
                >
                  <Image source={{ uri: url }} style={styles.viewerImage} resizeMode="contain" />
                </Pressable>
              ))}
            </ScrollView>
          )}
          {viewerImages && viewerImages.length > 1 && (
            <View style={[styles.viewerDots, { bottom: insets.bottom + 24 }]}>
              {viewerImages.map((url, i) => (
                <View
                  key={url}
                  style={[
                    styles.viewerDot,
                    { backgroundColor: i === viewerIndex ? "#fff" : "rgba(255,255,255,0.4)" },
                  ]}
                />
              ))}
            </View>
          )}
          <Pressable
            style={[styles.viewerClose, { top: topPad + 16 }]}
            onPress={() => setViewerImages(null)}
            hitSlop={12}
          >
            <Feather name="x" size={26} color="#fff" />
          </Pressable>
        </View>
      </Modal>

      <VideoModal
        visible={!!playingVideoUrl}
        uri={playingVideoUrl}
        onClose={() => setPlayingVideoUrl(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  centerText: { fontSize: 16 },
  backLink: { fontSize: 15, fontWeight: "600" as const },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600" as const, textAlign: "center" },
  content: { flex: 1 },
  banner: { width: "100%", height: 220, resizeMode: "cover" },
  bannerPlaceholder: { width: "100%", height: 220, alignItems: "center", justifyContent: "center" },
  infoSection: { padding: 16 },
  businessName: { fontSize: 22, fontWeight: "700" as const, marginBottom: 10 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  categoryBadgeText: { fontSize: 13, fontWeight: "500" as const },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  detailsCard: { borderRadius: 12, borderWidth: 1, borderColor: "#EBEBEB", overflow: "hidden" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  detailText: { fontSize: 14, flex: 1 },
  separator: { height: 1, marginLeft: 14 },
  productsSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 14 },
  emptyProducts: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15 },
  productsGrid: { gap: 14 },
  productCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden", position: "relative" },
  deleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(224,30,55,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: { width: "100%", height: 200, resizeMode: "cover" },
  productImagePlaceholder: { width: "100%", height: 160, alignItems: "center", justifyContent: "center" },
  productInfo: { padding: 14 },
  productName: { fontSize: 16, fontWeight: "600" as const, marginBottom: 6 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 6 },
  productCategoryBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  productCategoryText: { fontSize: 12, fontWeight: "500" as const },
  conditionBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  conditionBadgeText: { fontSize: 12, fontWeight: "600" as const, color: "#fff" },
  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  deliveryBadgeText: { fontSize: 11, fontWeight: "600" as const },
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerImage: { width: "100%", height: "85%" },
  viewerClose: {
    position: "absolute",
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  productPrice: { fontSize: 18, fontWeight: "700" as const, marginBottom: 6 },
  productDescription: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 12 },
  inquireBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inquireBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerIconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  productActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  productActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewerDots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  viewerDot: { width: 8, height: 8, borderRadius: 4 },
  photoCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoCountText: { color: "#fff", fontSize: 11, fontWeight: "600" as const },
  videoPlayBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
