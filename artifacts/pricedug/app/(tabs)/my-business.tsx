import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import {
  useGetMyBusiness,
  useGetMyProducts,
  useDeleteProduct,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function MyBusinessScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: business, isLoading: bizLoading } = useGetMyBusiness({ query: { enabled: !!isSignedIn } });
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useGetMyProducts({ query: { enabled: !!isSignedIn && !!business } });
  const deleteProduct = useDeleteProduct();

  if (!isSignedIn) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={48} color={colors.mutedForeground} />
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>Sign in required</Text>
        <Text style={[styles.centerSubtitle, { color: colors.mutedForeground }]}>
          Log in to manage your business page
        </Text>
        <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(auth)/sign-in")}>
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/(auth)/sign-up")}>
          <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  if (bizLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleDeleteProduct = (productId: number, productName: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteProduct.mutateAsync({ productId });
            refetchProducts();
          },
        },
      ]
    );
  };

  if (!business) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="briefcase" size={48} color={colors.mutedForeground} />
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>No Business Yet</Text>
        <Text style={[styles.centerSubtitle, { color: colors.mutedForeground }]}>
          Create your business page to list your products and reach customers
        </Text>
        <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/edit-business")}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Create Business Page</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Business</Text>
        <Pressable onPress={() => router.push(`/business/${business.id}`)}>
          <Text style={[styles.viewPublicText, { color: colors.primary }]}>View public page</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Card */}
        <View style={[styles.businessCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {business.imageUrl ? (
            <Image source={{ uri: business.imageUrl }} style={styles.businessBanner} />
          ) : (
            <View style={[styles.businessBannerPlaceholder, { backgroundColor: colors.secondary }]}>
              <Feather name="image" size={32} color={colors.primary} />
            </View>
          )}

          {business.isHidden && (
            <View style={styles.hiddenBanner}>
              <Feather name="eye-off" size={14} color="#fff" />
              <Text style={styles.hiddenBannerText}>Hidden from public</Text>
            </View>
          )}

          <View style={styles.businessInfo}>
            <Text style={[styles.businessName, { color: colors.foreground }]}>{business.name}</Text>
            {business.categoryName && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>{business.categoryName}</Text>
              </View>
            )}
            {business.description && (
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{business.description}</Text>
            )}
            {business.address && (
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{business.address}</Text>
              </View>
            )}
            {business.phone && (
              <View style={styles.infoRow}>
                <Feather name="phone" size={13} color={colors.mutedForeground} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{business.phone}</Text>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.editBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/edit-business")}
          >
            <Feather name="edit-2" size={14} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit Business Info</Text>
          </Pressable>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Products ({products.length})
            </Text>
            <Pressable
              style={[styles.addProductBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/add-product")}
            >
              <Feather name="plus" size={14} color="#fff" />
              <Text style={styles.addProductBtnText}>Add</Text>
            </Pressable>
          </View>

          {productsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : products.length === 0 ? (
            <View style={[styles.emptyProducts, { borderColor: colors.border }]}>
              <Feather name="package" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No products yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                Add products with photos and prices
              </Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {products.map((product) => (
                <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Feather name="image" size={20} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.productDetails}>
                    <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {product.price && (
                      <Text style={[styles.productPrice, { color: colors.primary }]}>
                        UGX {product.price}
                      </Text>
                    )}
                    {product.size && (
                      <Text style={[styles.productMeta, { color: colors.mutedForeground }]}>
                        Size: {product.size}
                      </Text>
                    )}
                    {product.materials && (
                      <Text style={[styles.productMeta, { color: colors.mutedForeground }]}>
                        Material: {product.materials}
                      </Text>
                    )}
                  </View>
                  <View style={styles.productActions}>
                    <Pressable onPress={() => router.push(`/edit-product/${product.id}`)}>
                      <Feather name="edit-2" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteProduct(product.id, product.name)}>
                      <Feather name="trash-2" size={18} color={colors.destructive} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

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
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
  secondaryBtn: { paddingVertical: 8 },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" as const },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" as const },
  viewPublicText: { fontSize: 14, fontWeight: "500" as const },
  content: { flex: 1 },
  businessCard: { margin: 16, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  businessBanner: { width: "100%", height: 160, resizeMode: "cover" },
  businessBannerPlaceholder: { width: "100%", height: 160, alignItems: "center", justifyContent: "center" },
  hiddenBanner: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E01E37",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hiddenBannerText: { color: "#fff", fontSize: 12, fontWeight: "500" as const },
  businessInfo: { padding: 14 },
  businessName: { fontSize: 18, fontWeight: "700" as const, marginBottom: 8 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  categoryBadgeText: { fontSize: 12, fontWeight: "500" as const },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    margin: 14,
    marginTop: 0,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  editBtnText: { fontSize: 14, fontWeight: "600" as const },
  productsSection: { paddingHorizontal: 16 },
  productsSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  addProductBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  addProductBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  emptyProducts: { alignItems: "center", gap: 8, paddingVertical: 36, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 12 },
  emptyText: { fontSize: 15, fontWeight: "600" as const },
  emptySubtext: { fontSize: 13 },
  productsList: { gap: 10 },
  productCard: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden", alignItems: "center" },
  productImage: { width: 80, height: 80, resizeMode: "cover" },
  productImagePlaceholder: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  productDetails: { flex: 1, padding: 10 },
  productName: { fontSize: 14, fontWeight: "600" as const, marginBottom: 3 },
  productPrice: { fontSize: 15, fontWeight: "700" as const, marginBottom: 2 },
  productMeta: { fontSize: 12 },
  productActions: { flexDirection: "column", alignItems: "center", gap: 14, paddingHorizontal: 12 },
});
