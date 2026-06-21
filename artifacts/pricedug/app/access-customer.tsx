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
import {
  useGetMyBusiness,
  useLookupCustomer,
  useGetAdminCustomers,
  type Customer,
} from "@workspace/api-client-react";
import ReadOnlyMap from "@/components/ReadOnlyMap";
import { useColors } from "@/hooks/useColors";
import { useAppAuth } from "@/context/AuthContext";

function CustomerCard({ customer }: { customer: Customer }) {
  const colors = useColors();
  const hasPin = customer.latitude != null && customer.longitude != null;

  const openWhatsApp = () => {
    const num = customer.phone.replace(/[^0-9]/g, "");
    Linking.openURL(`whatsapp://send?phone=${num}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}`)
    );
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
  const [notFound, setNotFound] = useState(false);

  const canAccess = isAdmin || !!business;

  const handleLookup = async () => {
    if (!phone.trim() || !district.trim()) return;
    setResult(null);
    setNotFound(false);
    try {
      const customer = await lookup.mutateAsync({
        data: { phone: phone.trim(), district: district.trim() },
      });
      setResult(customer);
    } catch {
      setNotFound(true);
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

        {notFound && (
          <View style={[styles.notFound, { borderColor: colors.border }]}>
            <Feather name="user-x" size={28} color={colors.mutedForeground} />
            <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
              No customer found with that phone number and district.
            </Text>
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
  notFoundText: { fontSize: 14, textAlign: "center", paddingHorizontal: 24 },
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
  adminSection: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 12 },
  emptyText: { fontSize: 14, marginVertical: 16 },
});
