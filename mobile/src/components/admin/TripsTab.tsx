import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAdmin } from "../../context/AdminContext";
import { ApiTrip, TripStatus } from "../../types/admin";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/EmptyState";
import { TripFormModal } from "./TripFormModal";

const TRIP_FILTERS: { key: string; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "programado", label: "Programado" },
  { key: "en_curso", label: "En Curso" },
  { key: "finalizado", label: "Finalizado" },
  { key: "cancelado", label: "Cancelado" },
];

const TRIP_BADGES: Record<
  TripStatus,
  { label: string; bg: string; text: string }
> = {
  programado: { label: "Programado", bg: "#DBEAFE", text: "#1D4ED8" },
  en_curso: { label: "En Curso", bg: "#FEF3C7", text: "#B45309" },
  finalizado: { label: "Finalizado", bg: "#DCFCE7", text: "#15803D" },
  cancelado: { label: "Cancelado", bg: "#FEE2E2", text: "#B91C1C" },
};

export const TripsTab = () => {
  const { trips, routes, vehicles, saveTrip, removeTrip } = useAdmin();
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<ApiTrip | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { todos: trips.length };
    trips.forEach((t) => {
      map[t.estado] = (map[t.estado] || 0) + 1;
    });
    return map;
  }, [trips]);

  const filtered = useMemo(() => {
    if (selectedFilter === "todos") return trips;
    return trips.filter((t) => t.estado === selectedFilter);
  }, [trips, selectedFilter]);

  const getRouteName = (rutaId: string) => {
    const r = routes.find((item) => item.id === rutaId);
    return r ? `${r.origen} ➔ ${r.destino}` : "Ruta desconocida";
  };

  const getVehicleInfo = (vehiculoId: string) => {
    const v = vehicles.find((item) => item.id === vehiculoId);
    return {
      label: v ? `${v.nombre} (${v.capacidad} pax)` : "Vehículo no encontrado",
      capacidad: v?.capacidad || 0,
    };
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-SV", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleOpenCreate = () => {
    setEditingTrip(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (trip: ApiTrip) => {
    setEditingTrip(trip);
    setModalVisible(true);
  };

  const handleDelete = (trip: ApiTrip) => {
    Alert.alert(
      "Eliminar viaje",
      `¿Estás seguro de eliminar el viaje de "${getRouteName(trip.rutaId)}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTrip(trip.id);
              Toast.show({ type: "success", text1: "Viaje eliminado" });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "No se pudo eliminar",
                text2: err?.message,
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <View style={styles.chipsWrap}>
          {TRIP_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              count={counts[f.key] || 0}
              active={selectedFilter === f.key}
              onPress={() => setSelectedFilter(f.key)}
            />
          ))}
        </View>

        <Button
          title="Programar Nuevo Viaje"
          icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          onPress={handleOpenCreate}
          style={styles.addBtn}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bus-outline"
          title="Sin viajes programados"
          description={
            selectedFilter === "todos"
              ? "Programa un nuevo viaje asignando una ruta y un vehículo."
              : "No hay viajes con el estado seleccionado."
          }
          actionTitle={
            selectedFilter === "todos" ? "Programar Viaje" : "Ver todos"
          }
          onAction={
            selectedFilter === "todos"
              ? handleOpenCreate
              : () => setSelectedFilter("todos")
          }
        />
      ) : (
        <View>
          {filtered.map((trip) => {
            const badge = TRIP_BADGES[trip.estado] || TRIP_BADGES.programado;
            const vehInfo = getVehicleInfo(trip.vehiculoId);
            const isFull =
              vehInfo.capacidad > 0 &&
              trip.asientosOcupados >= vehInfo.capacidad;

            return (
              <View key={trip.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.routeTitle}>
                      {getRouteName(trip.rutaId)}
                    </Text>
                    <Text style={styles.dateText}>
                      Salida: {formatDate(trip.fechaSalida)}
                    </Text>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: badge.text }]}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRows}>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="car-sport-outline"
                      size={16}
                      color={colors.textMuted}
                    />
                    <Text style={styles.infoText}>{vehInfo.label}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.textMuted}
                    />
                    <Text style={styles.infoText}>
                      {trip.conductor || "Sin conductor asignado"}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons
                      name="people-outline"
                      size={16}
                      color={isFull ? colors.danger : "#15803D"}
                    />
                    <Text
                      style={[
                        styles.occupancyText,
                        { color: isFull ? colors.danger : "#15803D" },
                      ]}
                    >
                      Ocupación: {trip.asientosOcupados} / {vehInfo.capacidad}{" "}
                      asientos {isFull ? "(Lleno)" : ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(trip)}
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(trip)}
                  >
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <TripFormModal
        visible={modalVisible}
        editing={editingTrip}
        routes={routes}
        vehicles={vehicles}
        onClose={() => setModalVisible(false)}
        onSave={saveTrip}
        onDelete={removeTrip}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  topControls: {
    marginBottom: 16,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  addBtn: {
    height: 42,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
    marginBottom: 10,
  },
  routeTitle: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 19,
    color: colors.primary,
  },
  dateText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },
  infoRows: {
    gap: 6,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.primary,
  },
  occupancyText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  editBtnText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.primary,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: colors.surface,
  },
  deleteBtnText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.danger,
  },
});
