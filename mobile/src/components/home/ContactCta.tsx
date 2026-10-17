import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import {
  BUSINESS_HOURS,
  GENERAL_QUOTE_MESSAGE,
  buildWhatsAppUrl,
} from "../../config/constants";

export const ContactCta = () => {
  const handleChat = async () => {
    const url = buildWhatsAppUrl(GENERAL_QUOTE_MESSAGE);
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Error al abrir WhatsApp:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="logo-whatsapp" size={32} color={colors.whatsapp} />
      </View>

      <Text style={styles.title}>¿TIENES DUDAS?</Text>

      <Text style={styles.description}>
        Escríbenos por WhatsApp y te respondemos de inmediato. Cotizamos tu
        ruta, coordinamos horarios y confirmamos tu reserva.
      </Text>

      <Button
        title="Chatear por WhatsApp"
        variant="whatsapp"
        icon={<Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />}
        onPress={handleChat}
        style={styles.button}
      />

      <Text style={styles.hours}>{BUSINESS_HOURS}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 32,
    color: colors.primary,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 340,
  },
  button: {
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  hours: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: "center",
  },
});
