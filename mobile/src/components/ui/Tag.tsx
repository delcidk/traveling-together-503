import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors } from "../../theme/colors";

interface TagProps {
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "default" | "solid" | "pill";
}

export const Tag = ({ text, style, textStyle, variant = "default" }: TagProps) => {
  return (
    <View
      style={[
        styles.tag,
        variant === "solid" && styles.tagSolid,
        variant === "pill" && styles.tagPill,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "solid" && styles.textSolid,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  tagSolid: {
    backgroundColor: "#E5E7EB",
    borderColor: "transparent",
  },
  tagPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: colors.border,
  },
  text: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#4B5563",
  },
  textSolid: {
    color: colors.primary,
  },
});
