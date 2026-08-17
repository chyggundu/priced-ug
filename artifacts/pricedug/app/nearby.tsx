import React, { useEffect, useState } from "react";
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
import * as Location from "expo-location";
import { useGetBusinesses } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

type LocationState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error" }
  | { status: "ready"; latitude: number; longitude: number };

export default function NearbyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [location, setLocation] = useState<LocationState>({ status: "loading" });
  const { data: businesses = [], isLoading } = useGetBusinesses();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          setLocation({ status: "denied" });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setLocation({
          status: "ready",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch {
        if (!cancelled) setLocation({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const withCoords = businesses.filter((b) => b.latitude != null && b.longitude != null);
  const sorted =
    location.status === "ready"
      ? withCoords
          .map((b) => ({
            ...b,
            distance: distanceKm(location.latitude, location.longitude, b.latitude!, b.longitude!),
          }))
          .sort((a, b) => a.distance - b.distance)
      : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nearby Stores</Text>
        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.backBtn} hitSlop={4}>
          <Feather name="home" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {location.status === "loading" || isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
            Finding stores near you...
          </Text>
        </View>
      ) : location.status === "denied" ? (
        <View style={styles.center}>
          <Feather name="map-pin" size={40} color={colors.mutedForeground} />
          <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
            Location permission is needed to show stores near you. You can enable it in your device
            settings.
          </Text>
        </View>
      ) : location.status === "error" ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
            Could not get your location. Please try again.
          </Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.center}>
          <Feather name="map" size={40} color={colors.mutedForeground} />
          <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
            No stores have shared their location yet.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {sorted.map((biz) => (
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
                <View style={[styles.distanceBadge, { backgroundColor: colors.secondary }]}>
                  <Feather name="navigation" size={11} color={colors.primary} />
                  <Text style={[styles.distanceText, { color: colors.primary }]}>
                    {formatDistance(biz.distance)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
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
  centerText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  content: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
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
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  distanceText: { fontSize: 12, fontWeight: "600" as const },
});
