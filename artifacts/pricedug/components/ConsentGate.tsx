import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { LegalAgreementBody } from "@/components/LegalAgreementBody";
import {
  LEGAL_ACCEPTED_STORAGE_KEY,
  LEGAL_AGREEMENT_VERSION,
  LEGAL_AGREEMENT_TITLE,
} from "@/constants/legalAgreement";

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<"loading" | "needed" | "accepted">("loading");
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const accepted = await AsyncStorage.getItem(LEGAL_ACCEPTED_STORAGE_KEY);
        if (!active) return;
        setStatus(accepted != null ? "accepted" : "needed");
      } catch {
        if (active) setStatus("needed");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAccept = async () => {
    if (!checked || saving) return;
    setSaving(true);
    setError(false);
    try {
      await AsyncStorage.setItem(LEGAL_ACCEPTED_STORAGE_KEY, LEGAL_AGREEMENT_VERSION);
      setStatus("accepted");
    } catch {
      setError(true);
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (status === "accepted") {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{LEGAL_AGREEMENT_TITLE}</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <LegalAgreementBody />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.checkRow} onPress={() => setChecked((v) => !v)}>
          <View
            style={[
              styles.checkbox,
              { borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : "transparent" },
            ]}
          >
            {checked && <Feather name="check" size={15} color="#fff" />}
          </View>
          <Text style={[styles.checkLabel, { color: colors.foreground }]}>
            I have read and agree to the User Agreement, Liability Waiver, Binding Arbitration, and Class
            Action Waiver above.
          </Text>
        </Pressable>

        {error && (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            Couldn&apos;t save your consent. Please try again.
          </Text>
        )}

        <Pressable
          style={[styles.acceptBtn, { backgroundColor: colors.primary, opacity: checked && !saving ? 1 : 0.5 }]}
          onPress={handleAccept}
          disabled={!checked || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptBtnText}>Agree & Continue</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700" as const, paddingHorizontal: 20, marginBottom: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkLabel: { flex: 1, fontSize: 13, lineHeight: 19 },
  errorText: { fontSize: 13, textAlign: "center" },
  acceptBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  acceptBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
