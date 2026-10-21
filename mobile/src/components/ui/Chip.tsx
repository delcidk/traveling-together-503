import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

interface ChipProps {
  label: string;
  count?: number;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const Chip = ({ label, count, active, onPress, style }: ChipProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {label}
        {count !== undefined ? (
          <Text style={active ? styles.countActive : styles.countInactive}>
            {` (${count})`}
          </Text>
        ) : null}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  text: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  textActive: {
    color: "#FFFFFF",
  },
  textInactive: {
    color: "#374151",
  },
  countActive: {
    color: "#D1D5DB",
  },
  countInactive: {
    color: colors.textSubtle,
  },
});
