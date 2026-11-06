import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { ApiReservation, ReservationStatus } from "../../src/types/admin";
import { subscribeUserReservations } from "../../src/services/firestore";
import { fetchApi, authHeaders } from "../../src/services/api";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { colors } from "../../src/theme/colors";
import { buildWhatsAppUrl } from "../../src/config/constants";

type FilterStatus = "todas" | ReservationStatus;

const STATUS_BADGE: Record<
  ReservationStatus,
  { label: string; bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pendiente: {
    label: "Pendiente",
    bg: "#FEF3C7",
    text: "#B45309",
    icon: "time-outline",
  },
  confirmada: {
    label: "Confirmada",
    bg: "#DBEAFE",
    text: "#1D4ED8",
    icon: "checkmark-circle-outline",
  },
  pagada: {
    label: "Pagada",
    bg: "#DCFCE7",
    text: "#15803D",
    icon: "card-outline",
  },
  cancelada: {
    label: "Cancelada",
    bg: "#FEE2E2",
    text: "#B91C1C",
    icon: "close-circle-outline",
  },
};

const FILTER_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "confirmada", label: "Confirmadas" },
  { key: "pagada", label: "Pagadas" },
  { key: "cancelada", label: "Canceladas" },
];

export default function MyReservationsScreen() {
  const router = useRouter();
  const { user, getToken } = useAuth();

  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("todas");

  const fetchFromRest = useCallback(async () => {
    if (!user?.uid) {
      setReservations([]);
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      if (!token) return;
      const data = await fetchApi<ApiReservation[]>(
        `/api/reservations?userId=${user.uid}`,
        { headers: authHeaders(token) }
      );
      const sorted = [...(data || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReservations(sorted);
    } catch (err) {
      console.error("Error cargando mis reservas:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, getToken]);

  useEffect(() => {
    if (!user?.uid) {
      setReservations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserReservations(
      user.uid,
      (liveItems) => {
        setReservations(liveItems);
        setLoading(false);
        setRefreshing(false);
      },
      () => {
        fetchFromRest();
      }
    );

    return () => unsubscribe();
  }, [user?.uid, fetchFromRest]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFromRest();
  };

  const handleCancelReservation = (item: ApiReservation) => {
    Alert.alert(
      "Cancelar reservación",
      `¿Estás seguro de que deseas cancelar tu reserva para "${
        item.rutaNombre || "este viaje"
      }"?`,
      [
        { text: "No, conservar", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setCancellingId(item.id);
              const token = await getToken();
              if (!token) throw new Error("Sesión expirada");

              const updated = await fetchApi<ApiReservation>(
                `/api/reservations/${item.id}`,
                {
                  method: "PUT",
                  headers: authHeaders(token),
                  body: JSON.stringify({ estado: "cancelada" }),
                }
              );

              setReservations((prev) =>
                prev.map((r) => (r.id === item.id ? updated : r))
              );
            } catch (err: any) {
              Alert.alert(
                "No se pudo cancelar",
                err?.message || "Ocurrió un error al cancelar la reserva."
              );
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const handleWhatsAppSupport = async (item: ApiReservation) => {
    const msg = `Hola, consulto por mi reservación #${item.id.slice(0, 8)} (${
      item.rutaNombre || "Ruta programada"
    }, ${item.pasajeros} pasajero${item.pasajeros > 1 ? "s" : ""}).`;
    const url = buildWhatsAppUrl(msg);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
    }
  };

  const filteredReservations = useMemo(() => {
    if (statusFilter === "todas") return reservations;
    return reservations.filter((r) => r.estado === statusFilter);
  }, [reservations, statusFilter]);

  const metrics = useMemo(() => {
    const total = reservations.length;
    const activas = reservations.filter(
      (r) => r.estado === "pendiente" || r.estado === "confirmada"
    ).length;
    const pagadas = reservations.filter((r) => r.estado === "pagada").length;
    return { total, activas, pagadas };
  }, [reservations]);

  const formatDate = (iso?: string) => {
    if (!iso) return "Fecha por confirmar";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-SV", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.screenTitle}>HISTORIAL DE RESERVAS</Text>
            <Text style={styles.screenSubtitle}>
              Consulta el estado en tiempo real de tus viajes solicitados.
            </Text>

            {/* Tarjetas de resumen */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.total}</Text>
                <Text style={styles.metricLabel}>Total</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.activas}</Text>
                <Text style={styles.metricLabel}>En proceso</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.pagadas}</Text>
                <Text style={styles.metricLabel}>Pagadas</Text>
              </View>
            </View>

            {/* Filtros por estado */}
            <View style={styles.filtersRow}>
              {FILTER_OPTIONS.map((opt) => {
                const active = statusFilter === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setStatusFilter(opt.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active && styles.filterChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={
              statusFilter === "todas"
                ? "Sin reservas todavía"
                : `Sin reservas ${statusFilter}s`
            }
            description={
              statusFilter === "todas"
                ? "Explora nuestras rutas y reserva tu próximo viaje."
                : "No tienes reservaciones con este estado actualmente."
            }
            actionTitle="Ver rutas disponibles"
            onAction={() => router.push("/(app)/routes")}
          />
        }
        renderItem={({ item }) => {
          const badge = STATUS_BADGE[item.estado] || STATUS_BADGE.pendiente;
          const isCancelling = cancellingId === item.id;

          return (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.routeTitle}>
                    {item.rutaNombre || "Ruta programada"}
                  </Text>
                  <Text style={styles.reservationCode}>
                    Reserva #{item.id.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Ionicons name={badge.icon} size={14} color={badge.text} />
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.detailText}>
                    Salida: {formatDate(item.fechaSalida)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.detailText}>
                    {item.pasajeros} pasajero{item.pasajeros > 1 ? "s" : ""} •
                    Total: ${Number(item.precioTotal || 0).toFixed(2)} USD
                  </Text>
                </View>

                {item.clienteTelefono ? (
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="call-outline"
                      size={16}
                      color={colors.textMuted}
                    />
                    <Text style={styles.detailText}>
                      Contacto: {item.clienteTelefono}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textSubtle}
                  />
                  <Text style={styles.createdText}>
                    Solicitada el {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => handleWhatsAppSupport(item)}
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={16}
                    color={colors.whatsapp}
                  />
                  <Text style={styles.supportBtnText}>Consultar</Text>
                </TouchableOpacity>

                {item.estado === "pendiente" && (
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      isCancelling && styles.cancelBtnDisabled,
                    ]}
                    onPress={() => handleCancelReservation(item)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#B91C1C" />
                    ) : (
                      <>
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color="#B91C1C"
                        />
                        <Text style={styles.cancelBtnText}>
                          Cancelar reserva
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  headerSection: {
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 28,
    color: colors.primary,
  },
  screenSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  metricValue: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 24,
    color: colors.primary,
  },
  metricLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: colors.textMuted,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  routeTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
  reservationCode: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },
  detailsGrid: {
    gap: 6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.primary,
  },
  createdText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: colors.textSubtle,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  supportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  supportBtnText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.primary,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelBtnDisabled: {
    opacity: 0.6,
  },
  cancelBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#B91C1C",
  },
});
