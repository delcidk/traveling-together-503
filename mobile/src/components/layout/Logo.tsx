import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface LogoProps {
  size?: "sm" | "md";
  style?: ViewStyle;
}

export const Logo = ({ size = "md", style }: LogoProps) => {
  const isSmall = size === "sm";
  const fontSize = isSmall ? 16 : 18;
  const iconSize = isSmall ? 14 : 16;

  return (
    <View style={[styles.logoContainer, style]}>
      <View style={[styles.iconContainer, isSmall && styles.iconContainerSm]}>
        <Ionicons name="bus" size={iconSize} color="#fff" />
      </View>
      <Text style={[styles.logoText, { fontSize }]}>TRAVELING TOGETHER </Text>
      <Text style={[styles.logoTextGray, { fontSize }]}>503</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
  },
  iconContainerSm: {
    padding: 3,
    marginRight: 6,
  },
  logoText: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    color: colors.primary,
  },
  logoTextGray: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    color: colors.textMuted,
  },
});
