import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { colors } from "../../theme/colors";

interface SectionLabelProps {
  text: string;
  style?: TextStyle;
}

export const SectionLabel = ({ text, style }: SectionLabelProps) => {
  return <Text style={[styles.label, style]}>{text}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
});
