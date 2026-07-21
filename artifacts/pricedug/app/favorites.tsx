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
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { isSignedIn, isLoading, favorites, toggleBusiness, toggleProduct } = useFavorites();

  const businesses = favorites?.businesses ?? [];
  const products = favorites?.products ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Favorites</Text>
        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.backBtn} hitSlop={4}>
          <Feather name="home" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {!isSignedIn ? (
        <View style={styles.center}>
          <Feather name="heart" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Sign in to save your favorite items and stores
          </Text>
          <Pressable
            style={[styles.signInBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : businesses.length === 0 && products.length === 0 ? (
        <View style={styles.center}>
          <Feather name="heart" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No favorites yet. Tap the heart on any item or store to save it here.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {businesses.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Stores <Text style={[styles.count, { color: colors.mutedForeground }]}>({businesses.length})</Text>
              </Text>
              {businesses.map((biz) => (
                <Pressable
                  key={biz.id}
                  style={[styles.storeRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/business/${biz.id}`)}
                >
                  {biz.imageUrl ? (
                    <Image source={{ uri: biz.imageUrl }} style={styles.storeImage} />
                  ) : (
                    <View style={[styles.storeImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Feather name="briefcase" size={20} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.storeInfo}>
                    <Text style={[styles.storeName, { color: colors.foreground }]} numberOfLines={1}>
                      {biz.name}
                    </Text>
                    {biz.city && (
                      <View style={styles.metaRow}>
                        <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {biz.city}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Pressable onPress={() => toggleBusiness(biz.id)} hitSlop={8} style={styles.heartBtn}>
                    <Feather name="heart" size={20} color={colors.primary} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}

          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Items <Text style={[styles.count, { color: colors.mutedForeground }]}>({products.length})</Text>
              </Text>
              <View style={styles.grid}>
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push(`/business/${product.businessId}?highlight=${product.id}`)}
                  >
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
                    ) : (
                      <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.secondary }]}>
                        <Feather name="package" size={28} color={colors.primary} />
                      </View>
                    )}
                    <Pressable
                      onPress={() => toggleProduct(product.id)}
                      hitSlop={8}
                      style={styles.cardHeart}
                    >
                      <Feather name="heart" size={16} color="#fff" />
                    </Pressable>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
                        {product.name}
                      </Text>
                      {product.price && (
                        <Text style={[styles.cardPrice, { color: colors.primary }]} numberOfLines={1}>
                          UGX {product.price}
                        </Text>
                      )}
                      <View style={styles.metaRow}>
                        <Feather name="briefcase" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {product.businessName}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600" as const, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  emptyText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  signInBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  signInBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
  content: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 12 },
  count: { fontSize: 14, fontWeight: "400" as const },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  storeImage: { width: 52, height: 52, borderRadius: 10 },
  storeImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: "600" as const, marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, flex: 1 },
  heartBtn: { padding: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47%", borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cardImage: { width: "100%", height: 120, resizeMode: "cover" },
  cardImagePlaceholder: { width: "100%", height: 120, alignItems: "center", justifyContent: "center" },
  cardHeart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(224,30,55,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: "600" as const, marginBottom: 4 },
  cardPrice: { fontSize: 13, fontWeight: "700" as const, marginBottom: 4 },
});
