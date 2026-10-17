import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { StatsRow } from "./StatsRow";

interface HeroSectionProps {
  onSeeServices: () => void;
  onQuote: () => void;
}

export const HeroSection = ({ onSeeServices, onQuote }: HeroSectionProps) => {
  const { width } = useWindowDimensions();
  const titleFontSize = Math.min(60, Math.max(44, Math.floor(width * 0.155)));
  const titleLineHeight = Math.floor(titleFontSize * 0.96);

  return (
    <View style={styles.container}>
      {/* Badge de países */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          EL SALVADOR · GUATEMALA · NICARAGUA
        </Text>
      </View>

      {/* Título Principal */}
      <View style={styles.titleBlock}>
        <Text
          style={[
            styles.titlePrimary,
            { fontSize: titleFontSize, lineHeight: titleLineHeight },
          ]}
        >
          TRAVELING{"\n"}TOGETHER
        </Text>
        <Text
          style={[
            styles.titleSecondary,
            { fontSize: titleFontSize, lineHeight: titleLineHeight },
          ]}
        >
          503
        </Text>
      </View>

      {/* Descripción */}
      <Text style={styles.description}>
        Transporte privado para turistas y viajeros en Centroamérica. Cómodo,
        seguro y con atención personalizada en cada ruta.
      </Text>

      {/* Botones CTA */}
      <View style={styles.buttonsContainer}>
        <Button
          title="Ver todos los servicios"
          onPress={onSeeServices}
          rightIcon={<Feather name="arrow-up-right" size={18} color="#FFFFFF" />}
          style={styles.button}
        />
        <Button
          title="Cotizar por WhatsApp"
          variant="outline"
          icon={<Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp} />}
          onPress={onQuote}
          style={styles.button}
          textStyle={styles.outlineButtonText}
        />
      </View>

      {/* Divisor */}
      <View style={styles.divider} />

      {/* Estadísticas */}
      <StatsRow />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  titleBlock: {
    marginBottom: 16,
  },
  titlePrimary: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  titleSecondary: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    color: colors.textMuted,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 28,
  },
  button: {
    width: "100%",
  },
  outlineButtonText: {
    fontFamily: "Poppins_500Medium",
    color: "#374151",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
});
