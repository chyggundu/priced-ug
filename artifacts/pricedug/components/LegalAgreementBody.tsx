import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import {
  LEGAL_AGREEMENT_INTRO,
  LEGAL_AGREEMENT_SECTIONS,
} from "@/constants/legalAgreement";

export function LegalAgreementBody() {
  const colors = useColors();
  return (
    <View>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>{LEGAL_AGREEMENT_INTRO}</Text>
      {LEGAL_AGREEMENT_SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>{section.heading}</Text>
          <Text style={[styles.body, { color: colors.foreground }]}>{section.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 20, marginBottom: 18 },
  section: { marginBottom: 18 },
  heading: { fontSize: 15, fontWeight: "700" as const, marginBottom: 6 },
  body: { fontSize: 13, lineHeight: 20 },
});
