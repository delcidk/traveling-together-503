import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { Logo } from "./Logo";
import {
  WHATSAPP_DISPLAY,
  GENERAL_QUOTE_MESSAGE,
  buildWhatsAppUrl,
} from "../../config/constants";

export const AppFooter = () => {
  const handleWhatsApp = async () => {
    const url = buildWhatsAppUrl(GENERAL_QUOTE_MESSAGE);
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Error al abrir WhatsApp:", err);
    }
  };

  return (
    <View style={styles.footer}>
      <Logo size="sm" style={styles.logo} />

      <Text style={styles.description}>
        Agencia de transporte privado para turistas en El Salvador, Guatemala y
        Nicaragua.
      </Text>

      <TouchableOpacity
        style={styles.whatsappBadge}
        onPress={handleWhatsApp}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-whatsapp" size={16} color={colors.whatsapp} />
        <Text style={styles.whatsappText}>{WHATSAPP_DISPLAY}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: "flex-start",
  },
  logo: {
    marginBottom: 12,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  whatsappBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.whatsapp,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "transparent",
    gap: 6,
  },
  whatsappText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: colors.whatsapp,
  },
});
