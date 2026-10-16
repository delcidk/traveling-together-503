import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRoutes } from "../../../src/context/RoutesContext";
import { ApiRoute } from "../../../src/types/route";
import { colors } from "../../../src/theme/colors";
import { PhotoPlaceholder } from "../../../src/components/ui/PhotoPlaceholder";
import { Tag } from "../../../src/components/ui/Tag";
import { StatBox } from "../../../src/components/ui/StatBox";
import { SectionLabel } from "../../../src/components/ui/SectionLabel";
import { Button } from "../../../src/components/ui/Button";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { QuoteModal } from "../../../src/components/routes/QuoteModal";
import {
  DEFAULT_CAPACITY,
  DEFAULT_INCLUDES,
  CATEGORY_LABELS,
  buildWhatsAppUrl,
} from "../../../src/config/constants";
import {
  getDurationHours,
  formatPriceDetail,
  buildGeneralInquiryMessage,
} from "../../../src/utils/routeHelpers";

const PLACEHOLDER_GALLERY = [
  "Vista del recorrido",
  "Interior del vehículo",
  "Punto de partida",
  "Punto de llegada",
];

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById } = useRoutes();

  const [route, setRoute] = useState<ApiRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      getById(id).then((data) => {
        if (isMounted) {
          setRoute(data);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id, getById]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!route) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Destino no encontrado"
          description="La ruta que buscas no existe o ya no está disponible."
          actionTitle="Volver a rutas"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const duration = getDurationHours(route.distanciaKm);
  const categoryLabel = route.categoria
    ? CATEGORY_LABELS[route.categoria] || route.categoria
    : "Destino";

  const handleConsultWhatsApp = async () => {
    const message = buildGeneralInquiryMessage(route);
    const url = buildWhatsAppUrl(message);
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Error abriendo WhatsApp:", err);
    }
  };

  const galleryItems =
    route.galeria && route.galeria.length > 0
      ? route.galeria
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón de volver */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color={colors.primary} />
        <Text style={styles.backBtnText}>Volver a rutas</Text>
      </TouchableOpacity>

      {/* Foto Principal */}
      <View style={styles.mainImageContainer}>
        <PhotoPlaceholder
          imageUrl={route.imagenUrl}
          placeholderText="Foto principal de la ruta"
          aspectRatio={4 / 3}
        />
      </View>

      {/* Categoría e ID */}
      <View style={styles.metaHeader}>
        <Tag text={categoryLabel} variant="solid" />
        <Text style={styles.idText}>ID: {route.id.slice(0, 12)}</Text>
      </View>

      {/* Títulos y Descripción */}
      <Text style={styles.title}>
        {route.origen} ➔ {route.destino}
      </Text>
      <Text style={styles.subtitle}>
        {route.origen} ➔ {route.destino}
      </Text>

      <Text style={styles.description}>
        {route.descripcion ||
          "Viaje directo y privado con todo el confort que mereces. Nuestra flota garantiza puntualidad, seguridad y el mejor servicio."}
      </Text>

      {/* 3 Cajas de Estadísticas */}
      <View style={styles.statsRow}>
        <StatBox label="Duración" value={duration} style={styles.statBoxItem} />
        <StatBox
          label="Capacidad"
          value={`hasta ${DEFAULT_CAPACITY} pax`}
          style={styles.statBoxItem}
        />
        <StatBox
          label="Precio desde"
          value={formatPriceDetail(route.tarifaBase)}
          style={styles.statBoxItem}
        />
      </View>

      {/* Sección INCLUYE */}
      <View style={styles.section}>
        <SectionLabel text="INCLUYE" />
        <View style={styles.tagsRow}>
          {DEFAULT_INCLUDES.map((tag, idx) => (
            <Tag key={idx} text={tag} style={styles.tagItem} />
          ))}
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionsRow}>
        <Button
          title="Reservar ahora"
          onPress={() => setIsQuoteOpen(true)}
          style={styles.reserveBtn}
        />
        <Button
          title="Consultar"
          variant="whatsappOutline"
          icon={<Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />}
          onPress={handleConsultWhatsApp}
          style={styles.consultBtn}
        />
      </View>

      {/* Separador */}
      <View style={styles.divider} />

      {/* Sección GALERÍA DE FOTOS */}
      <View style={styles.section}>
        <SectionLabel text="GALERÍA DE FOTOS" />
        <View style={styles.galleryGrid}>
          {galleryItems ? (
            galleryItems.map((url, idx) => (
              <View key={idx} style={styles.galleryItem}>
                <PhotoPlaceholder
                  imageUrl={url}
                  placeholderText={`Foto ${idx + 1}`}
                  aspectRatio={1}
                />
              </View>
            ))
          ) : (
            PLACEHOLDER_GALLERY.map((label, idx) => (
              <View key={idx} style={styles.galleryItem}>
                <PhotoPlaceholder
                  placeholderText={label}
                  aspectRatio={1}
                />
              </View>
            ))
          )}
        </View>
      </View>

      {/* Modal de Cotización */}
      <QuoteModal
        visible={isQuoteOpen}
        route={route}
        onClose={() => setIsQuoteOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "flex-start",
    paddingVertical: 4,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.primary,
  },
  mainImageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  idText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.textSubtle,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 32,
    color: colors.primary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statBoxItem: {
    flex: 1,
    padding: 10,
  },
  section: {
    marginBottom: 20,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagItem: {
    marginRight: 2,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 24,
  },
  reserveBtn: {
    flex: 1,
    height: 48,
  },
  consultBtn: {
    flex: 1,
    height: 48,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  galleryItem: {
    width: "48%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
