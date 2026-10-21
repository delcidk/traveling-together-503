import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt, idx) => {
        const isActive = opt.value === value;
        const isFirst = idx === 0;
        const isLast = idx === options.length - 1;

        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.segment,
              isFirst && styles.firstSegment,
              isLast && styles.lastSegment,
              isActive ? styles.segmentActive : styles.segmentInactive,
            ]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segment: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  firstSegment: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  lastSegment: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentInactive: {
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  labelActive: {
    color: "#FFFFFF",
  },
  labelInactive: {
    color: "#374151",
  },
});
