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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { useGetCategories, useGetProducts } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const WHATSAPP_NUMBER = "18186603495";

const CONDITION_OPTIONS = ["New", "Slightly Used", "Used"] as const;

type SortKey = "newest" | "priceAsc" | "priceDesc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "priceAsc", label: "Price: Low to High" },
  { key: "priceDesc", label: "Price: High to Low" },
];

function parsePrice(price?: string | null): number | null {
  if (!price) return null;
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

type Colors = ReturnType<typeof useColors>;

function FilterChips({
  options,
  selected,
  onSelect,
  colors,
}: {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  colors: Colors;
}) {
  return (
    <View style={styles.chipWrap}>
      <Pressable
        style={[styles.filterChip, { backgroundColor: selected == null ? colors.primary : colors.muted }]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.filterChipText, { color: selected == null ? "#fff" : colors.foreground }]}>All</Text>
      </Pressable>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <Pressable
            key={opt}
            style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.muted }]}
            onPress={() => onSelect(active ? null : opt)}
          >
            {active && <Feather name="check" size={12} color="#fff" style={{ marginRight: 4 }} />}
            <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const distinct = (values: (string | null | undefined)[]) =>
    Array.from(new Set(values.map((v) => (v ?? "").trim()).filter((v) => v.length > 0))).sort((a, b) =>
      a.localeCompare(b)
    );

  const districtOptions = distinct(products.map((p) => p.businessCity));
  const sizeOptions = distinct(products.map((p) => p.size));
  const colorOptions = distinct(products.map((p) => p.color));

  const activeFilterCount =
    (selectedCity ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (selectedCondition ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const clearFilters = () => {
    setSelectedCity(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedCondition(null);
    setSortBy("newest");
  };

  const filteredProducts = products
    .filter((p) =>
      selectedCity && districtOptions.includes(selectedCity)
        ? (p.businessCity ?? "").trim() === selectedCity
        : true
    )
    .filter((p) => (selectedSize ? (p.size ?? "").trim() === selectedSize : true))
    .filter((p) => (selectedColor ? (p.color ?? "").trim() === selectedColor : true))
    .filter((p) => (selectedCondition ? (p.condition ?? "").trim() === selectedCondition : true))
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

        <View style={styles.searchRow}>
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
          <Pressable
            style={[styles.filterBtn, { backgroundColor: activeFilterCount > 0 ? colors.primary : colors.muted }]}
            onPress={() => setFiltersOpen(true)}
          >
            <Feather name="sliders" size={18} color={activeFilterCount > 0 ? "#fff" : colors.foreground} />
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
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
              {activeFilterCount > 0 && (
                <Pressable onPress={clearFilters}>
                  <Text style={[styles.clearLink, { color: colors.primary }]}>Clear filters</Text>
                </Pressable>
              )}
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
                    {(product.condition || product.color) && (
                      <View style={styles.cardBadgeRow}>
                        {product.condition && (
                          <View style={[styles.conditionBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.conditionBadgeText}>{product.condition}</Text>
                          </View>
                        )}
                        {product.color && (
                          <View style={[styles.colorTag, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.colorTagText, { color: colors.mutedForeground }]} numberOfLines={1}>
                              {product.color}
                            </Text>
                          </View>
                        )}
                      </View>
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

      {/* Filter panel */}
      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFiltersOpen(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Filters</Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={8}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.foreground }]}>Sort by</Text>
                <View style={styles.chipWrap}>
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortBy === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.muted }]}
                        onPress={() => setSortBy(opt.key)}
                      >
                        {active && <Feather name="check" size={12} color="#fff" style={{ marginRight: 4 }} />}
                        <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.foreground }]}>Condition</Text>
                <FilterChips
                  options={[...CONDITION_OPTIONS]}
                  selected={selectedCondition}
                  onSelect={setSelectedCondition}
                  colors={colors}
                />
              </View>

              {districtOptions.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.foreground }]}>District</Text>
                  <FilterChips
                    options={districtOptions}
                    selected={selectedCity}
                    onSelect={setSelectedCity}
                    colors={colors}
                  />
                </View>
              )}

              {sizeOptions.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.foreground }]}>Size</Text>
                  <FilterChips
                    options={sizeOptions}
                    selected={selectedSize}
                    onSelect={setSelectedSize}
                    colors={colors}
                  />
                </View>
              )}

              {colorOptions.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.foreground }]}>Color</Text>
                  <FilterChips
                    options={colorOptions}
                    selected={selectedColor}
                    onSelect={setSelectedColor}
                    colors={colors}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.clearBtn, { borderColor: colors.border }]}
                onPress={clearFilters}
              >
                <Text style={[styles.clearBtnText, { color: colors.foreground }]}>Clear all</Text>
              </Pressable>
              <Pressable
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={() => setFiltersOpen(false)}
              >
                <Text style={styles.applyBtnText}>
                  Show {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBtn: {
    width: 46,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterCountText: { color: "#fff", fontSize: 11, fontWeight: "700" as const },
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
  clearLink: { fontSize: 15, fontWeight: "600" as const },
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
  cardBadgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginBottom: 6 },
  conditionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  conditionBadgeText: { fontSize: 10, fontWeight: "700" as const, color: "#fff" },
  colorTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: "60%",
  },
  colorTagText: { fontSize: 10, fontWeight: "600" as const },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" as const },
  modalBody: { marginBottom: 8 },
  filterSection: { paddingVertical: 12 },
  filterSectionTitle: { fontSize: 15, fontWeight: "700" as const, marginBottom: 10 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: { fontSize: 14, fontWeight: "500" as const },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
  },
  clearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: { fontSize: 15, fontWeight: "600" as const },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },
});
