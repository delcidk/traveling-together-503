import React, { useState, useMemo } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAdmin } from "../../context/AdminContext";
import { ApiReservation, ReservationStatus } from "../../types/admin";
import { colors } from "../../theme/colors";
import { Chip } from "../ui/Chip";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ReservationCard } from "./ReservationCard";
import { ReservationFormModal } from "./ReservationFormModal";
import { countByStatus, filterByStatus } from "../../utils/adminHelpers";

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendiente" },
  { key: "confirmada", label: "Confirmado" },
  { key: "pagada", label: "Pagada" },
  { key: "cancelada", label: "Cancelado" },
];

export const ReservationsTab = () => {
  const {
    reservations,
    trips,
    routes,
    users,
    changeStatus,
    saveReservation,
    removeReservation,
  } = useAdmin();

  const [selectedStatus, setSelectedStatus] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<ApiReservation | null>(null);

  const counts = useMemo(() => countByStatus(reservations), [reservations]);
  const filtered = useMemo(() => {
    const byStatus = filterByStatus(reservations, selectedStatus);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter(
      (r) =>
        r.clienteNombre?.toLowerCase().includes(q) ||
        r.clienteTelefono?.toLowerCase().includes(q) ||
        r.rutaNombre?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [reservations, selectedStatus, searchQuery]);

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    try {
      await changeStatus(id, status);
      Toast.show({
        type: "success",
        text1: "Estado actualizado",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al cambiar estado",
        text2: err?.message,
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingReservation(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (reservation: ApiReservation) => {
    setEditingReservation(reservation);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Chips de estado + Buscador + Botón Agregar */}
      <View style={styles.topControls}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, teléfono o ruta..."
            placeholderTextColor={colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.chipsWrap}>
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              count={counts[f.key] || 0}
              active={selectedStatus === f.key}
              onPress={() => setSelectedStatus(f.key)}
            />
          ))}
        </View>

        <Button
          title="Agregar Reserva Manual"
          icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          onPress={handleOpenCreate}
          style={styles.addBtn}
        />
      </View>

      {/* Lista de tarjetas */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Sin reservaciones"
          description={
            selectedStatus === "todas"
              ? "Aún no hay reservaciones registradas."
              : "No hay reservaciones con el estado seleccionado."
          }
          actionTitle={
            selectedStatus === "todas"
              ? "Crear reserva manual"
              : "Ver todas"
          }
          onAction={
            selectedStatus === "todas"
              ? handleOpenCreate
              : () => setSelectedStatus("todas")
          }
        />
      ) : (
        <View>
          {filtered.map((item) => (
            <ReservationCard
              key={item.id}
              reservation={item}
              trips={trips}
              routes={routes}
              onChangeStatus={handleStatusChange}
              onEdit={handleOpenEdit}
            />
          ))}
        </View>
      )}

      <ReservationFormModal
        visible={modalVisible}
        editing={editingReservation}
        trips={trips}
        routes={routes}
        users={users}
        onClose={() => setModalVisible(false)}
        onSave={saveReservation}
        onDelete={removeReservation}
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.primary,
    paddingVertical: 2,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  addBtn: {
    height: 42,
  },
});
