import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { HOME_STATS } from "../../config/constants";

export const StatsRow = () => {
  return (
    <View style={styles.row}>
      {HOME_STATS.map((stat, idx) => (
        <View key={idx} style={styles.statItem}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 28,
  },
  statItem: {
    flexDirection: "column",
  },
  value: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 26,
    color: colors.primary,
    lineHeight: 30,
  },
  label: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
