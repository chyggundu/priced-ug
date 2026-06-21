import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import * as Clipboard from "expo-clipboard";
import {
  useGetMyBusiness,
  useLookupCustomer,
  useGetAdminCustomers,
  type Customer,
} from "@workspace/api-client-react";
import ReadOnlyMap from "@/components/ReadOnlyMap";
import { useColors } from "@/hooks/useColors";
import { useAppAuth } from "@/context/AuthContext";

type LookupErrorKind = "notFound" | "forbidden" | "server" | "network" | "unknown";

const RETRYABLE_LOOKUP_ERRORS: ReadonlySet<LookupErrorKind> = new Set([
  "network",
  "server",
  "unknown",
]);

function classifyLookupError(err: unknown): LookupErrorKind {
  const status =
    err && typeof err === "object" && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : undefined;

  if (status === undefined) return "network";
  if (status === 404) return "notFound";
  if (status === 401 || status === 403) return "forbidden";
  if (status >= 500) return "server";
  return "unknown";
}

const LOOKUP_ERROR_CONTENT: Record<
  LookupErrorKind,
  { icon: keyof typeof Feather.glyphMap; title: string; message: string }
> = {
  notFound: {
    icon: "user-x",
    title: "No customer found",
    message: "No customer matches that phone number and district. Double-check the details and try again.",
  },
  forbidden: {
    icon: "lock",
    title: "Access not allowed",
    message: "You don't have permission to look up this customer. Make sure your business page is active.",
  },
  server: {
    icon: "alert-triangle",
    title: "Something went wrong",
    message: "Our server ran into a problem. Please try again in a moment.",
  },
  network: {
    icon: "wifi-off",
    title: "No internet connection",
    message: "We couldn't reach the server. Check your connection and try again.",
  },
  unknown: {
    icon: "alert-circle",
    title: "Lookup failed",
    message: "Something unexpected happened. Please try again.",
  },
};

function CustomerCard({ customer }: { customer: Customer }) {
  const colors = useColors();
  const hasPin = customer.latitude != null && customer.longitude != null;
  const [copied, setCopied] = useState(false);

  const addressLine = [customer.street, customer.village, customer.town, customer.district]
    .filter(Boolean)
    .join(", ");
  const mapsLink = hasPin
    ? `https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`
    : null;

  const buildLocationText = () => {
    const parts = [`${customer.fullName}'s location`];
    if (addressLine) parts.push(addressLine);
    if (mapsLink) parts.push(mapsLink);
    return parts.join("\n");
  };

  const openWhatsApp = () => {
    const num = customer.phone.replace(/[^0-9]/g, "");
    Linking.openURL(`whatsapp://send?phone=${num}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}`)
    );
  };

  const shareLocationOnWhatsApp = () => {
    const text = encodeURIComponent(buildLocationText());
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() =>
      Linking.openURL(`https://wa.me/?text=${text}`)
    );
  };

  const copyLocation = async () => {
    await Clipboard.setStringAsync(buildLocationText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.cardName, { color: colors.foreground }]}>{customer.fullName}</Text>

      <View style={styles.row}>
        <Feather name="phone" size={14} color={colors.mutedForeground} />
        <Text style={[styles.rowText, { color: colors.foreground }]}>{customer.phone}</Text>
      </View>
      <View style={styles.row}>
        <Feather name="map-pin" size={14} color={colors.mutedForeground} />
        <Text style={[styles.rowText, { color: colors.foreground }]}>
          {[customer.village, customer.town, customer.district].filter(Boolean).join(", ")}
        </Text>
      </View>
      {customer.street ? (
        <View style={styles.row}>
          <Feather name="navigation" size={14} color={colors.mutedForeground} />
          <Text style={[styles.rowText, { color: colors.foreground }]}>{customer.street}</Text>
        </View>
      ) : null}

      {hasPin && (
        <View style={{ marginTop: 12 }}>
          <ReadOnlyMap latitude={customer.latitude!} longitude={customer.longitude!} height={180} />
        </View>
      )}

      <Pressable style={[styles.waBtn, { backgroundColor: "#25D366" }]} onPress={openWhatsApp}>
        <Feather name="message-circle" size={16} color="#fff" />
        <Text style={styles.waBtnText}>Message on WhatsApp</Text>
      </Pressable>

      {addressLine || mapsLink ? (
        <>
          <Pressable
            style={[styles.waBtn, { backgroundColor: "#128C7E", marginTop: 10 }]}
            onPress={shareLocationOnWhatsApp}
          >
            <Feather name="share-2" size={16} color="#fff" />
            <Text style={styles.waBtnText}>Share location on WhatsApp</Text>
          </Pressable>

          <Pressable
            style={[styles.copyBtn, { borderColor: colors.border }]}
            onPress={copyLocation}
          >
            <Feather name={copied ? "check" : "copy"} size={16} color={colors.primary} />
            <Text style={[styles.copyBtnText, { color: colors.primary }]}>
              {copied ? "Location copied" : "Copy location"}
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

export default function AccessCustomerScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { isSignedIn } = useAuth();
  const { isAdmin } = useAppAuth();

  const { data: business, isLoading: bizLoading } = useGetMyBusiness({
    query: { enabled: !!isSignedIn && !isAdmin, retry: false },
  });
  const lookup = useLookupCustomer();
  const { data: allCustomers = [], isLoading: listLoading } = useGetAdminCustomers({
    query: { enabled: !!isSignedIn && isAdmin },
  });

  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [result, setResult] = useState<Customer | null>(null);
  const [lookupError, setLookupError] = useState<LookupErrorKind | null>(null);

  const canAccess = isAdmin || !!business;

  const handleLookup = async () => {
    if (!phone.trim() || !district.trim()) return;
    setResult(null);
    setLookupError(null);
    try {
      const customer = await lookup.mutateAsync({
        data: { phone: phone.trim(), district: district.trim() },
      });
      setResult(customer);
    } catch (err) {
      setLookupError(classifyLookupError(err));
    }
  };

  if (!isSignedIn || (!canAccess && !bizLoading)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Access Customer</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={[styles.center, { paddingTop: 80 }]}>
          <Feather name="lock" size={48} color={colors.mutedForeground} />
          <Text style={[styles.centerTitle, { color: colors.foreground }]}>Business owners only</Text>
          <Text style={[styles.centerSubtitle, { color: colors.mutedForeground }]}>
            Create a business page to look up your customers' delivery details.
          </Text>
        </View>
      </View>
    );
  }

  if (bizLoading && !isAdmin) {
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Access Customer</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>
            Enter the customer's registered phone number and district to retrieve their delivery details.
          </Text>

          <Text style={[styles.label, { color: colors.foreground }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +256700000000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: colors.foreground }]}>District</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={district}
            onChangeText={setDistrict}
            placeholder="e.g. Kampala"
            placeholderTextColor={colors.mutedForeground}
          />

          <Pressable
            style={[
              styles.lookupBtn,
              { backgroundColor: colors.primary, opacity: lookup.isPending || !phone.trim() || !district.trim() ? 0.6 : 1 },
            ]}
            onPress={handleLookup}
            disabled={lookup.isPending || !phone.trim() || !district.trim()}
          >
            {lookup.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="search" size={16} color="#fff" />
                <Text style={styles.lookupBtnText}>Find Customer</Text>
              </>
            )}
          </Pressable>
        </View>

        {lookupError && (
          <View style={[styles.notFound, { borderColor: colors.border }]}>
            <Feather
              name={LOOKUP_ERROR_CONTENT[lookupError].icon}
              size={28}
              color={colors.mutedForeground}
            />
            <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>
              {LOOKUP_ERROR_CONTENT[lookupError].title}
            </Text>
            <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
              {LOOKUP_ERROR_CONTENT[lookupError].message}
            </Text>
            {RETRYABLE_LOOKUP_ERRORS.has(lookupError) && (
              <Pressable
                style={[styles.retryBtn, { backgroundColor: colors.primary, opacity: lookup.isPending ? 0.6 : 1 }]}
                onPress={handleLookup}
                disabled={lookup.isPending}
              >
                {lookup.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="refresh-cw" size={16} color="#fff" />
                    <Text style={styles.retryBtnText}>Try again</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        )}

        {result && (
          <View style={{ paddingHorizontal: 16 }}>
            <CustomerCard customer={result} />
          </View>
        )}

        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              All Customers ({allCustomers.length})
            </Text>
            {listLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
            ) : allCustomers.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No customers yet.</Text>
            ) : (
              allCustomers.map((c) => <CustomerCard key={c.id} customer={c} />)
            )}
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  centerTitle: { fontSize: 18, fontWeight: "700" as const, textAlign: "center" },
  centerSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600" as const, textAlign: "center" },
  content: { flex: 1 },
  form: { padding: 16, gap: 4 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600" as const, marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  lookupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  lookupBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
  notFound: {
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingVertical: 28,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  notFoundTitle: { fontSize: 16, fontWeight: "700" as const, textAlign: "center" },
  notFoundText: { fontSize: 14, textAlign: "center", paddingHorizontal: 24, lineHeight: 20 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 6,
  },
  retryBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardName: { fontSize: 17, fontWeight: "700" as const, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  rowText: { fontSize: 14, flex: 1 },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 14,
  },
  waBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: 10,
  },
  copyBtnText: { fontSize: 15, fontWeight: "600" as const },
  adminSection: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 12 },
  emptyText: { fontSize: 14, marginVertical: 16 },
});
