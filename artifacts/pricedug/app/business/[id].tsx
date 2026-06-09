import React from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetBusiness, useGetBusinessProducts } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { BusinessReviews } from "@/components/BusinessReviews";

export default function BusinessDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const businessId = parseInt(id ?? "0");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: business, isLoading: bizLoading } = useGetBusiness(businessId);
  const { data: products = [], isLoading: productsLoading } = useGetBusinessProducts(businessId, {
    query: { enabled: !!business },
  });

  const openWhatsApp = (phone: string) => {
    Linking.openURL(`whatsapp://send?phone=${phone.replace(/\D/g, "")}`)
      .catch(() => Linking.openURL(`tel:${phone}`));
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
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
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.centerText, { color: colors.mutedForeground }]}>Business not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
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
        <View style={{ width: 40 }} />
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
              </>
            )}
            {business.phone && (
              <>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <Pressable style={styles.detailRow} onPress={() => callPhone(business.phone!)}>
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
              {products.map((product) => (
                <View
                  key={product.id}
                  style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Feather name="image" size={24} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.categoryName && (
                      <View style={[styles.productCategoryBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.productCategoryText, { color: colors.primary }]}>
                          {product.categoryName}
                        </Text>
                      </View>
                    )}
                    {product.price && (
                      <Text style={[styles.productPrice, { color: colors.primary }]}>
                        UGX {product.price}
                      </Text>
                    )}
                    {product.description && (
                      <Text style={[styles.productDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    {(product.size || product.materials) && (
                      <View style={styles.tagRow}>
                        {product.size && (
                          <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                              Size: {product.size}
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
                    {business.phone && (
                      <Pressable
                        style={[styles.inquireBtn, { backgroundColor: "#25D366" }]}
                        onPress={() => openWhatsApp(business.phone!)}
                      >
                        <Feather name="message-circle" size={13} color="#fff" />
                        <Text style={styles.inquireBtnText}>Inquire</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <BusinessReviews businessId={businessId} ownerUserId={business.clerkUserId} />

        <View style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 32 }} />
      </ScrollView>
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
  productCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  productImage: { width: "100%", height: 200, resizeMode: "cover" },
  productImagePlaceholder: { width: "100%", height: 160, alignItems: "center", justifyContent: "center" },
  productInfo: { padding: 14 },
  productName: { fontSize: 16, fontWeight: "600" as const, marginBottom: 6 },
  productCategoryBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  productCategoryText: { fontSize: 12, fontWeight: "500" as const },
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
});
