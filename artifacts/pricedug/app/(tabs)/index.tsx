import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { useGetCategories, useGetProducts } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const WHATSAPP_NUMBER = "1234567890"; // Replace with actual WhatsApp number

function parsePrice(price?: string | null): number | null {
  if (!price) return null;
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export default function BrowseScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">("newest");

  // Debounce typing into the actual search query so items appear as you type.
  useEffect(() => {
    const handle = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories();
  const { data: products = [], isLoading: productsLoading } = useGetProducts({
    ...(selectedCategory ? { categoryId: selectedCategory } : {}),
    ...(searchQuery ? { q: searchQuery } : {}),
  });

  const cities = Array.from(
    new Set(
      products
        .map((p) => (p.businessCity ?? "").trim())
        .filter((c) => c.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredProducts = products
    .filter((p) =>
      selectedCity && cities.includes(selectedCity)
        ? (p.businessCity ?? "").trim() === selectedCity
        : true
    )
    .sort((a, b) => {
      if (sortBy === "priceAsc" || sortBy === "priceDesc") {
        const aPrice = parsePrice(a.price);
        const bPrice = parsePrice(b.price);
        if (aPrice == null && bPrice == null) return 0;
        if (aPrice == null) return 1;
        if (bPrice == null) return -1;
        return sortBy === "priceAsc" ? aPrice - bPrice : bPrice - aPrice;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "priceAsc", label: "Price: Low to High" },
    { key: "priceDesc", label: "Price: High to Low" },
  ];

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=Hi, I found your app Priced Ug and would like to know more.`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const resultsTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : selectedCategory
      ? categories.find((c) => c.id === selectedCategory)?.name ?? "Items"
      : "All Items";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>Priced Ug</Text>
            </View>
          </View>
          <Pressable onPress={openWhatsApp} style={styles.whatsappBtn}>
            <Feather name="message-circle" size={20} color="#25D366" />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search items..."
            placeholderTextColor={colors.mutedForeground}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => setSearchQuery(searchInput.trim())}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Sign Up prompt (signed-out visitors only) */}
        {!isSignedIn && (
          <View style={styles.section}>
            <Pressable
              style={[styles.signupBanner, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              <View style={styles.signupIcon}>
                <Feather name="user-plus" size={20} color="#fff" />
              </View>
              <View style={styles.signupTextWrap}>
                <Text style={styles.signupTitle}>Customer Sign Up</Text>
                <Text style={styles.signupSubtitle}>
                  Create a free account to save your details and order faster.
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
          {categoriesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <Pressable
                style={[
                  styles.categoryChip,
                  selectedCategory === null
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.muted },
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.categoryChipText, { color: selectedCategory === null ? "#fff" : colors.foreground }]}>
                  All
                </Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.muted },
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  <Text style={[styles.categoryChipText, { color: selectedCategory === cat.id ? "#fff" : colors.foreground }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Location */}
        {cities.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <Pressable
                style={[
                  styles.categoryChip,
                  selectedCity === null
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.muted },
                ]}
                onPress={() => setSelectedCity(null)}
              >
                <Text style={[styles.categoryChipText, { color: selectedCity === null ? "#fff" : colors.foreground }]}>
                  All
                </Text>
              </Pressable>
              {cities.map((cityName) => (
                <Pressable
                  key={cityName}
                  style={[
                    styles.categoryChip,
                    selectedCity === cityName
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.muted },
                  ]}
                  onPress={() => setSelectedCity(selectedCity === cityName ? null : cityName)}
                >
                  <Text style={[styles.categoryChipText, { color: selectedCity === cityName ? "#fff" : colors.foreground }]}>
                    {cityName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sort */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sort by</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {sortOptions.map((opt) => (
              <Pressable
                key={opt.key}
                style={[
                  styles.categoryChip,
                  sortBy === opt.key
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.muted },
                ]}
                onPress={() => setSortBy(opt.key)}
              >
                <Text style={[styles.categoryChipText, { color: sortBy === opt.key ? "#fff" : colors.foreground }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {resultsTitle}
            {" "}
            <Text style={{ color: colors.mutedForeground, fontSize: 14, fontWeight: "400" }}>
              ({filteredProducts.length})
            </Text>
          </Text>

          {productsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No items found
              </Text>
            </View>
          ) : (
            <View style={styles.businessGrid}>
              {filteredProducts.map((product) => (
                <Pressable
                  key={product.id}
                  style={[styles.businessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/business/${product.businessId}?highlight=${product.id}`)}
                >
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.businessImage} />
                  ) : (
                    <View style={[styles.businessImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Feather name="package" size={28} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.businessInfo}>
                    <Text style={[styles.businessName, { color: colors.foreground }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {product.price && (
                      <Text style={[styles.priceText, { color: colors.primary }]} numberOfLines={1}>
                        UGX {product.price}
                      </Text>
                    )}
                    <View style={styles.addressRow}>
                      <Feather name="briefcase" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {product.businessName}
                      </Text>
                    </View>
                    {product.businessCity && (
                      <View style={styles.addressRow}>
                        <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {product.businessCity}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoBadge: {
    backgroundColor: "#E01E37",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoText: { fontSize: 22, fontWeight: "bold" as const, color: "#fff" },
  whatsappBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  content: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 12 },
  categoriesScroll: { marginBottom: 4 },
  signupBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  signupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  signupTextWrap: { flex: 1 },
  signupTitle: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
  signupSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2, lineHeight: 16 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: { fontSize: 14, fontWeight: "500" as const },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15 },
  businessGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  businessCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  businessImage: { width: "100%", height: 120, resizeMode: "cover" },
  businessImagePlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  businessInfo: { padding: 10 },
  businessName: { fontSize: 14, fontWeight: "600" as const, marginBottom: 6 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressText: { fontSize: 11, flex: 1 },
  priceText: { fontSize: 13, fontWeight: "700" as const, marginBottom: 4 },
});
