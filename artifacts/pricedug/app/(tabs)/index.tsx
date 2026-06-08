import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetCategories, useGetBusinesses } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const WHATSAPP_NUMBER = "1234567890"; // Replace with actual WhatsApp number

export default function BrowseScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">("newest");

  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories();
  const { data: businesses = [], isLoading: businessesLoading } = useGetBusinesses({
    ...(selectedCategory ? { categoryId: selectedCategory } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  });

  const cities = Array.from(
    new Set(
      businesses
        .map((b) => (b.city ?? "").trim())
        .filter((c) => c.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredBusinesses = businesses
    .filter((b) =>
      selectedCity && cities.includes(selectedCity)
        ? (b.city ?? "").trim() === selectedCity
        : true
    )
    .sort((a, b) => {
      if (sortBy === "priceAsc" || sortBy === "priceDesc") {
        const aHas = a.minPrice != null;
        const bHas = b.minPrice != null;
        if (!aHas && !bHas) return 0;
        if (!aHas) return 1;
        if (!bHas) return -1;
        return sortBy === "priceAsc"
          ? (a.minPrice as number) - (b.minPrice as number)
          : (b.minPrice as number) - (a.minPrice as number);
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "priceAsc", label: "Price: Low to High" },
    { key: "priceDesc", label: "Price: High to Low" },
  ];

  const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=Hi, I found your app Priced Ug and would like to know more.`;
    const { Linking } = require("react-native");
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>P</Text>
            </View>
            <Text style={styles.logoText}>riced Ug</Text>
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
          <Pressable
            onPress={() => setSearchQuery(searchInput.trim())}
            style={[styles.goButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.goButtonText}>Go</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Businesses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCategory
              ? `${categories.find((c) => c.id === selectedCategory)?.name ?? ""}`
              : "All Items"}
            {" "}
            <Text style={{ color: colors.mutedForeground, fontSize: 14, fontWeight: "400" }}>
              ({filteredBusinesses.length})
            </Text>
          </Text>

          {businessesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : filteredBusinesses.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No items found
              </Text>
            </View>
          ) : (
            <View style={styles.businessGrid}>
              {filteredBusinesses.map((business) => (
                <Pressable
                  key={business.id}
                  style={[styles.businessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/business/${business.id}`)}
                >
                  {business.imageUrl ? (
                    <Image source={{ uri: business.imageUrl }} style={styles.businessImage} />
                  ) : (
                    <View style={[styles.businessImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Feather name="briefcase" size={28} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.businessInfo}>
                    <Text style={[styles.businessName, { color: colors.foreground }]} numberOfLines={1}>
                      {business.name}
                    </Text>
                    {business.categoryName && (
                      <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                          {business.categoryName}
                        </Text>
                      </View>
                    )}
                    {business.minPrice != null && (
                      <Text style={[styles.priceText, { color: colors.primary }]} numberOfLines={1}>
                        From {formatPrice(business.minPrice)}
                      </Text>
                    )}
                    {(business.city || business.address) && (
                      <View style={styles.addressRow}>
                        <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {business.city || business.address}
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
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E01E37",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  logoLetter: { color: "#fff", fontWeight: "bold" as const, fontSize: 18 },
  logoText: { fontSize: 22, fontWeight: "bold" as const, color: "#E01E37" },
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
  goButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  goButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
  content: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 12 },
  categoriesScroll: { marginBottom: 4 },
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
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: "500" as const },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressText: { fontSize: 11, flex: 1 },
  priceText: { fontSize: 13, fontWeight: "700" as const, marginBottom: 4 },
});
