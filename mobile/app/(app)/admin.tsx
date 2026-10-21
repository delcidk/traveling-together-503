import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { AdminProvider, useAdmin } from "../../src/context/AdminContext";
import { colors } from "../../src/theme/colors";
import { StatBox } from "../../src/components/ui/StatBox";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { AdminHeader } from "../../src/components/admin/AdminHeader";
import { ReservationsTab } from "../../src/components/admin/ReservationsTab";
import { RoutesTab } from "../../src/components/admin/RoutesTab";
import { countByStatus } from "../../src/utils/adminHelpers";

type AdminTabKey = "reservaciones" | "rutas";

const TAB_OPTIONS: { value: AdminTabKey; label: string }[] = [
  { value: "reservaciones", label: "Reservaciones" },
  { value: "rutas", label: "Rutas" },
];

function AdminDashboardContent() {
  const { userProfile } = useAuth();
  const { reservations, routes, loading, error, refresh } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("reservaciones");

  const statusCounts = useMemo(
    () => countByStatus(reservations),
    [reservations]
  );

  const activeRoutesCount = useMemo(
    () => routes.filter((r) => r.activa).length,
    [routes]
  );

  if (loading && reservations.length === 0 && routes.length === 0) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && reservations.length === 0 && routes.length === 0) {
    return (
      <View style={styles.centerBox}>
        <EmptyState
          icon="alert-circle-outline"
          title="Error al cargar el panel"
          description={error}
          actionTitle="Reintentar"
          onAction={refresh}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <AdminHeader
        name={userProfile?.nombre || "Administrador"}
        email={userProfile?.email || "admin@tt503.com"}
      />

      {/* Cuadrícula de Métricas 2x3 */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <StatBox
            value={statusCounts.todas || 0}
            sublabel="Total reservas"
            style={styles.metricItem}
          />
          <StatBox
            value={statusCounts.pendiente || 0}
            sublabel="Pendientes"
            style={styles.metricItem}
          />
        </View>

        <View style={styles.metricsRow}>
          <StatBox
            value={statusCounts.confirmada || 0}
            sublabel="Confirmadas"
            style={styles.metricItem}
          />
          <StatBox
            value={statusCounts.pagada || 0}
            sublabel="Pagadas"
            style={styles.metricItem}
          />
        </View>

        <View style={styles.metricsRow}>
          <StatBox
            value={statusCounts.cancelada || 0}
            sublabel="Canceladas"
            style={styles.metricItem}
          />
          <StatBox
            value={`${activeRoutesCount}/${routes.length}`}
            sublabel="Rutas activas"
            style={styles.metricItem}
          />
        </View>
      </View>

      {/* Selector de Pestaña */}
      <SegmentedControl
        options={TAB_OPTIONS}
        value={activeTab}
        onChange={setActiveTab}
        style={styles.segmented}
      />

      {/* Contenido de Pestaña */}
      {activeTab === "reservaciones" ? <ReservationsTab /> : <RoutesTab />}
    </ScrollView>
  );
}

export default function AdminScreen() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
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
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  metricsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricItem: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  segmented: {
    marginBottom: 16,
  },
});
