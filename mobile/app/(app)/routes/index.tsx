import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useRoutes } from "../../../src/context/RoutesContext";
import { ApiRoute } from "../../../src/types/route";
import { colors } from "../../../src/theme/colors";
import { SectionLabel } from "../../../src/components/ui/SectionLabel";
import { StatBox } from "../../../src/components/ui/StatBox";
import { Chip } from "../../../src/components/ui/Chip";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { RouteCard } from "../../../src/components/routes/RouteCard";
import { QuoteModal } from "../../../src/components/routes/QuoteModal";
import {
  CATEGORY_LABELS,
} from "../../../src/config/constants";
import {
  countByCategory,
  filterByCategory,
} from "../../../src/utils/routeHelpers";

const CATEGORIES = [
  "todos",
  "playa",
  "internacional",
  "aeropuerto",
  "ciudad",
  "escenico",
];

export default function RoutesScreen() {
  const router = useRouter();
  const { routes, loading, error, refresh } = useRoutes();
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [quoteRoute, setQuoteRoute] = useState<ApiRoute | null>(null);

  const categoryCounts = useMemo(() => countByCategory(routes), [routes]);

  const filteredRoutes = useMemo(
    () => filterByCategory(routes, selectedCategory),
    [routes, selectedCategory]
  );

  const handleOpenDetail = (route: ApiRoute) => {
    router.push(`/(app)/routes/${route.id}` as any);
  };

  const handleOpenQuote = (route: ApiRoute) => {
    setQuoteRoute(route);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SectionLabel text="NUESTROS SERVICIOS" />
      <Text style={styles.title}>RUTAS DISPONIBLES</Text>
      <Text style={styles.subtitle}>
        Transporte privado entre los destinos más populares de Centroamérica.
      </Text>

      {/* Caja de Rutas Activas */}
      <View style={styles.statContainer}>
        <StatBox
          label="rutas activas"
          value={routes.length}
          centered
        />
      </View>

      {/* Filtros por Categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={CATEGORY_LABELS[cat] || cat}
            count={categoryCounts[cat] || 0}
            active={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>
    </View>
  );

  if (loading && routes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && routes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Error al cargar rutas"
          description={error}
          actionTitle="Reintentar"
          onAction={refresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onReserve={handleOpenQuote}
            onViewDetail={handleOpenDetail}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="map-outline"
            title="Sin rutas en esta categoría"
            description="No encontramos rutas disponibles para el filtro seleccionado."
            actionTitle="Ver todas las rutas"
            onAction={() => setSelectedCategory("todos")}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* Modal de Cotización / Reserva */}
      <QuoteModal
        visible={!!quoteRoute}
        route={quoteRoute}
        onClose={() => setQuoteRoute(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  chipsScroll: {
    flexDirection: "row",
    paddingVertical: 4,
  },
});
