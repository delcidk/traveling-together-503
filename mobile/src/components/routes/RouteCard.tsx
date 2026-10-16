import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApiRoute } from "../../types/route";
import { colors } from "../../theme/colors";
import { PhotoPlaceholder } from "../ui/PhotoPlaceholder";
import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";
import {
  DEFAULT_CAPACITY,
  DEFAULT_INCLUDES,
  CATEGORY_LABELS,
  buildWhatsAppUrl,
} from "../../config/constants";
import {
  getDurationHours,
  formatPrice,
  buildGeneralInquiryMessage,
} from "../../utils/routeHelpers";

interface RouteCardProps {
  route: ApiRoute;
  onReserve: (route: ApiRoute) => void;
  onViewDetail: (route: ApiRoute) => void;
}

export const RouteCard = ({
  route,
  onReserve,
  onViewDetail,
}: RouteCardProps) => {
  const duration = getDurationHours(route.distanciaKm);
  const categoryLabel = route.categoria
    ? CATEGORY_LABELS[route.categoria] || route.categoria
    : null;

  const handleWhatsApp = async () => {
    const message = buildGeneralInquiryMessage(route);
    const url = buildWhatsAppUrl(message);
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Error al abrir WhatsApp:", err);
    }
  };

  return (
    <View style={styles.card}>
      {/* Contenedor de Imagen con Overlays */}
      <View style={styles.imageContainer}>
        <PhotoPlaceholder
          imageUrl={route.imagenUrl}
          placeholderText={`${route.origen} ➔ ${route.destino}`}
          aspectRatio={16 / 9}
        />
        {categoryLabel ? (
          <View style={styles.categoryBadge}>
            <Tag text={categoryLabel} variant="solid" />
          </View>
        ) : null}
        <View style={styles.priceBadge}>
          <Tag
            text={`desde ${formatPrice(route.tarifaBase)}`}
            variant="pill"
            textStyle={styles.priceBadgeText}
          />
        </View>
      </View>

      {/* Contenido de la Tarjeta */}
      <View style={styles.body}>
        <Text style={styles.title}>
          {route.origen} ➔ {route.destino}
        </Text>
        <Text style={styles.subtitle}>
          {route.origen} ➔ {route.destino}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {route.descripcion ||
            "Viaje directo y privado con todo el confort que mereces."}
        </Text>

        {/* Metadatos: Duración y Capacidad */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>Hasta {DEFAULT_CAPACITY} personas</Text>
          </View>
        </View>

        {/* Chips de Incluye */}
        <View style={styles.tagsRow}>
          {DEFAULT_INCLUDES.map((item, idx) => (
            <Tag key={idx} text={item} style={styles.tagItem} />
          ))}
        </View>

        {/* Fila de Botones */}
        <View style={styles.actionsRow}>
          <Button
            title="Reservar"
            onPress={() => onReserve(route)}
            style={styles.reserveBtn}
          />
          <Button
            title="Ver más"
            variant="outline"
            onPress={() => onViewDetail(route)}
            style={styles.detailBtn}
          />
          <TouchableOpacity
            style={styles.whatsappIconBtn}
            onPress={handleWhatsApp}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={22} color={colors.whatsapp} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  priceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  priceBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
  },
  body: {
    padding: 16,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 22,
    color: colors.primary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  tagItem: {
    marginRight: 2,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reserveBtn: {
    flex: 1,
    height: 42,
  },
  detailBtn: {
    paddingHorizontal: 16,
    height: 42,
  },
  whatsappIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.whatsapp,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
