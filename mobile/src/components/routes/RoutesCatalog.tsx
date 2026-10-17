import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRoutes } from "../../context/RoutesContext";
import { ApiRoute } from "../../types/route";
import { colors } from "../../theme/colors";
import { SectionLabel } from "../ui/SectionLabel";
import { StatBox } from "../ui/StatBox";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/EmptyState";
import { RouteCard } from "./RouteCard";
import { QuoteModal } from "./QuoteModal";
import { CATEGORY_LABELS } from "../../config/constants";
import {
  countByCategory,
  filterByCategory,
} from "../../utils/routeHelpers";

const CATEGORIES = [
  "todos",
  "playa",
  "internacional",
  "aeropuerto",
  "ciudad",
  "escenico",
];

interface RoutesCatalogProps {
  onViewDetail: (route: ApiRoute) => void;
}

export const RoutesCatalog = ({ onViewDetail }: RoutesCatalogProps) => {
  const { routes, loading, error, refresh } = useRoutes();
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [quoteRoute, setQuoteRoute] = useState<ApiRoute | null>(null);

  const categoryCounts = useMemo(() => countByCategory(routes), [routes]);

  const filteredRoutes = useMemo(
    () => filterByCategory(routes, selectedCategory),
    [routes, selectedCategory]
  );

  return (
    <View style={styles.container}>
      {/* Encabezado de sección */}
      <View style={styles.header}>
        <SectionLabel text="NUESTROS SERVICIOS" />
        <Text style={styles.title}>RUTAS DISPONIBLES</Text>
        <Text style={styles.subtitle}>
          Transporte privado entre los destinos más populares de Centroamérica.
        </Text>

        {/* Caja de Rutas Activas */}
        <View style={styles.statContainer}>
          <StatBox
            value={routes.length}
            sublabel="rutas activas"
            centered
          />
        </View>

        {/* Filtros por Categoría */}
        <View style={styles.chipsWrap}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={CATEGORY_LABELS[cat] || cat}
              count={cat === "todos" ? undefined : categoryCounts[cat] || 0}
              active={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </View>
      </View>

      {/* Estados y listado */}
      {loading && routes.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && routes.length === 0 ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Error al cargar rutas"
          description={error}
          actionTitle="Reintentar"
          onAction={refresh}
        />
      ) : filteredRoutes.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="Sin rutas en esta categoría"
          description="No encontramos rutas disponibles para el filtro seleccionado."
          actionTitle="Ver todas las rutas"
          onAction={() => setSelectedCategory("todos")}
        />
      ) : (
        <View>
          {filteredRoutes.map((item) => (
            <RouteCard
              key={item.id}
              route={item}
              onReserve={(r) => setQuoteRoute(r)}
              onViewDetail={onViewDetail}
            />
          ))}
        </View>
      )}

      {/* Modal de Cotización / Reserva */}
      <QuoteModal
        visible={!!quoteRoute}
        route={quoteRoute}
        onClose={() => setQuoteRoute(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 32,
    color: colors.primary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  statContainer: {
    marginBottom: 16,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  centerBox: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
