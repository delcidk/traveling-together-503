import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

interface StatBoxProps {
  label?: string;
  value: string | number;
  sublabel?: string;
  style?: ViewStyle;
  centered?: boolean;
}

export const StatBox = ({
  label,
  value,
  sublabel,
  style,
  centered = false,
}: StatBoxProps) => {
  return (
    <View style={[styles.box, centered && styles.centered, style]}>
      {label ? (
        <Text style={[styles.label, centered && styles.centeredText]}>{label}</Text>
      ) : null}
      <Text style={[styles.value, centered && styles.centeredText]}>{value}</Text>
      {sublabel ? (
        <Text style={[styles.sublabel, centered && styles.centeredText]}>{sublabel}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.textMuted,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontFamily: "BarlowCondensed_800ExtraBold",
    color: colors.primary,
  },
  sublabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.textSubtle,
    marginTop: 2,
  },
  centeredText: {
    textAlign: "center",
  },
});
