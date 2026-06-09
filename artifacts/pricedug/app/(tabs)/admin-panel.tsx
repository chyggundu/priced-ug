import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetAdminBusinesses,
  useGetCategories,
  useCreateCategory,
  useDeleteCategory,
  useToggleBusinessVisibility,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAppAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

export default function AdminPanelScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAppAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [newCategory, setNewCategory] = useState("");
  const [activeTab, setActiveTab] = useState<"businesses" | "categories">("businesses");

  const { data: businesses = [], isLoading: bizLoading, refetch: refetchBiz } = useGetAdminBusinesses();
  const { data: categories = [], isLoading: catLoading, refetch: refetchCat } = useGetCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const toggleVisibility = useToggleBusinessVisibility();

  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="shield-off" size={48} color={colors.mutedForeground} />
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>Admin Only</Text>
      </View>
    );
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await createCategory.mutateAsync({ data: { name: newCategory.trim() } });
    setNewCategory("");
    refetchCat();
  };

  const handleDeleteCategory = (id: number, name: string) => {
    Alert.alert("Delete Category", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCategory.mutateAsync({ id });
          refetchCat();
        },
      },
    ]);
  };

  const handleToggleVisibility = (id: number, currentlyHidden: boolean, name: string) => {
    const willHide = !currentlyHidden;
    Alert.alert(
      willHide ? "Hide Business" : "Unhide Business",
      willHide
        ? `"${name}" will be hidden from the public and from the owner until you unhide it.`
        : `"${name}" will be visible to the public and the owner again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: willHide ? "Hide" : "Unhide",
          style: willHide ? "destructive" : "default",
          onPress: async () => {
            await toggleVisibility.mutateAsync({ id, data: { isHidden: willHide } });
            refetchBiz();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Admin Panel</Text>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <Pressable
          style={[styles.tab, activeTab === "businesses" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("businesses")}
        >
          <Text style={[styles.tabText, { color: activeTab === "businesses" ? colors.primary : colors.mutedForeground }]}>
            Businesses ({businesses.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "categories" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("categories")}
        >
          <Text style={[styles.tabText, { color: activeTab === "categories" ? colors.primary : colors.mutedForeground }]}>
            Categories ({categories.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "businesses" && (
          <View style={styles.section}>
            {bizLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
            ) : businesses.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="briefcase" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No businesses registered</Text>
              </View>
            ) : (
              businesses.map((b) => (
                <View key={b.id} style={[styles.bizRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.bizInfo}>
                    <View style={styles.bizNameRow}>
                      <Text style={[styles.bizName, { color: colors.foreground }]} numberOfLines={1}>{b.name}</Text>
                      {b.isHidden && (
                        <View style={[styles.hiddenBadge, { backgroundColor: colors.secondary }]}>
                          <Feather name="eye-off" size={10} color={colors.primary} />
                          <Text style={[styles.hiddenBadgeText, { color: colors.primary }]}>Hidden</Text>
                        </View>
                      )}
                    </View>
                    {b.categories && b.categories.length > 0 && (
                      <Text style={[styles.bizCat, { color: colors.mutedForeground }]}>
                        {b.categories.map((c) => c.name).join(", ")}
                      </Text>
                    )}
                    {b.address && (
                      <Text style={[styles.bizAddr, { color: colors.mutedForeground }]} numberOfLines={1}>{b.address}</Text>
                    )}
                  </View>
                  <View style={styles.bizActions}>
                    <Pressable onPress={() => router.push(`/business/${b.id}`)} style={styles.previewBtn}>
                      <Feather name="eye" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleToggleVisibility(b.id, b.isHidden, b.name)}
                      style={[styles.toggleBtn, { backgroundColor: b.isHidden ? "#22C55E" : "#E01E37" }]}
                    >
                      <Feather name={b.isHidden ? "eye" : "eye-off"} size={13} color="#fff" />
                      <Text style={styles.toggleBtnText}>{b.isHidden ? "Unhide" : "Hide"}</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "categories" && (
          <View style={styles.section}>
            <View style={[styles.addCatRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.catInput, { color: colors.foreground, borderColor: colors.border }]}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="New category name..."
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable
                style={[styles.addBtn, { backgroundColor: colors.primary, opacity: !newCategory.trim() ? 0.5 : 1 }]}
                onPress={handleAddCategory}
                disabled={!newCategory.trim() || createCategory.isPending}
              >
                {createCategory.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="plus" size={20} color="#fff" />
                )}
              </Pressable>
            </View>

            {catLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
            ) : categories.length === 0 ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No categories yet</Text>
              </View>
            ) : (
              categories.map((cat) => (
                <View key={cat.id} style={[styles.catRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.catName, { color: colors.foreground }]}>{cat.name}</Text>
                  <Pressable onPress={() => handleDeleteCategory(cat.id, cat.name)}>
                    <Feather name="trash-2" size={18} color={colors.destructive} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 100 : insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  centerTitle: { fontSize: 20, fontWeight: "700" as const },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700" as const },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" as const },
  content: { flex: 1 },
  section: { padding: 16, gap: 10 },
  bizRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, padding: 12 },
  bizInfo: { flex: 1 },
  bizNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  bizName: { fontSize: 15, fontWeight: "600" as const, flex: 1 },
  hiddenBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  hiddenBadgeText: { fontSize: 10, fontWeight: "600" as const },
  bizCat: { fontSize: 12, marginBottom: 2 },
  bizAddr: { fontSize: 12 },
  bizActions: { flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 8 },
  previewBtn: { padding: 4 },
  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  toggleBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  addCatRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, padding: 10 },
  catInput: { flex: 1, fontSize: 15, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  catRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  catName: { flex: 1, fontSize: 15 },
  empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15 },
});
