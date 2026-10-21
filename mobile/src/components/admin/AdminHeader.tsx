import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { SectionLabel } from "../ui/SectionLabel";

interface AdminHeaderProps {
  name?: string;
  email?: string;
}

export const AdminHeader = ({
  name = "Administrador",
  email = "admin@tt503.com",
}: AdminHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftCol}>
          <SectionLabel text="ADMINISTRACIÓN" style={styles.eyebrow} />
          <Text style={styles.title}>PANEL DE CONTROL</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.adminName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.adminEmail} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  leftCol: {
    flex: 1,
  },
  eyebrow: {
    marginBottom: 4,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 30,
    color: colors.primary,
    textTransform: "uppercase",
  },
  rightCol: {
    alignItems: "flex-end",
    maxWidth: "45%",
  },
  adminName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#374151",
  },
  adminEmail: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: colors.textSubtle,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 16,
  },
});
