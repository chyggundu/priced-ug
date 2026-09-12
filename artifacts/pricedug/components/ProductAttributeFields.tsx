import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { CONDITION_OPTIONS } from "@/constants/product";
import { useColors } from "@/hooks/useColors";

export type ProductAttributes = {
  color: string;
  condition: string;
  deliveredByBusiness: boolean;
  deliveredByPricedUg: boolean;
};

/**
 * Colour, condition and delivery, used by this app's add- and edit-product
 * screens so the two stay identical. The website has its own equivalent.
 */
export function ProductAttributeFields({
  value,
  onChange,
}: {
  value: ProductAttributes;
  onChange: (next: ProductAttributes) => void;
}) {
  const colors = useColors();
  const set = <K extends keyof ProductAttributes>(key: K, next: ProductAttributes[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <>
      <Text style={[styles.label, { color: colors.foreground }]}>Colour</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
        value={value.color}
        onChangeText={(text) => set("color", text)}
        placeholder="e.g. Black, White, Navy"
        placeholderTextColor={colors.mutedForeground}
      />

      <Text style={[styles.label, { color: colors.foreground }]}>Condition</Text>
      <View style={styles.chipWrap}>
        {CONDITION_OPTIONS.map((option) => {
          const selected = value.condition === option;
          return (
            <Pressable
              key={option}
              // Tapping the selected chip clears it, as on the website.
              onPress={() => set("condition", selected ? "" : option)}
              style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.muted }]}
            >
              <Text style={[styles.chipText, { color: selected ? "#fff" : colors.foreground }]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.foreground }]}>Delivery</Text>
      {(
        [
          ["deliveredByBusiness", "Delivered by my business"],
          ["deliveredByPricedUg", "Delivered by Priced Ug"],
        ] as const
      ).map(([key, text]) => (
        <Pressable key={key} style={styles.checkRow} onPress={() => set(key, !value[key])}>
          <View
            style={[
              styles.checkbox,
              value[key]
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { borderColor: colors.border },
            ]}
          >
            {value[key] && <Feather name="check" size={13} color="#fff" />}
          </View>
          <Text style={[styles.checkLabel, { color: colors.foreground }]}>{text}</Text>
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600" as const, marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontWeight: "500" as const },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLabel: { fontSize: 15 },
});
