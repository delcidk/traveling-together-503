import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAdmin } from "../../context/AdminContext";
import { ApiVehicle, VehicleStatus } from "../../types/admin";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { Tag } from "../ui/Tag";
import { EmptyState } from "../ui/EmptyState";
import { VehicleFormModal } from "./VehicleFormModal";

const VEHICLE_STATUS_BADGE: Record<
  VehicleStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  disponible: {
    label: "Disponible",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#047857",
  },
  en_servicio: {
    label: "En Servicio",
    bg: "#DBEAFE",
    border: "#93C5FD",
    text: "#1D4ED8",
  },
  mantenimiento: {
    label: "Mantenimiento",
    bg: "#FEF3C7",
    border: "#FDE68A",
    text: "#B45309",
  },
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  van: "Van",
  microbus: "Microbús",
  bus: "Autobús",
};

export const VehiclesTab = () => {
  const { vehicles, saveVehicle, removeVehicle } = useAdmin();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<ApiVehicle | null>(null);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (vehicle: ApiVehicle) => {
    setEditingVehicle(vehicle);
    setModalVisible(true);
  };

  const handleDelete = (vehicle: ApiVehicle) => {
    Alert.alert(
      "Eliminar vehículo",
      `¿Estás seguro de que deseas eliminar el vehículo "${vehicle.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeVehicle(vehicle.id);
              Toast.show({ type: "success", text1: "Vehículo eliminado" });
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
      <Button
        title="Agregar Vehículo"
        icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
        onPress={handleOpenCreate}
        style={styles.addBtn}
      />

      {vehicles.length === 0 ? (
        <EmptyState
          icon="car-sport-outline"
          title="No hay vehículos registrados"
          description="Agrega tu primer vehículo a la flota para asignarlo a viajes programados."
          actionTitle="Agregar Vehículo"
          onAction={handleOpenCreate}
        />
      ) : (
        <View>
          {vehicles.map((vehicle) => {
            const status =
              VEHICLE_STATUS_BADGE[vehicle.estado] ||
              VEHICLE_STATUS_BADGE.disponible;
            const typeLabel =
              VEHICLE_TYPE_LABELS[vehicle.tipo] || vehicle.tipo.toUpperCase();

            return (
              <View key={vehicle.id} style={styles.card}>
                <View style={styles.row}>
                  {vehicle.imagenUrl ? (
                    <Image
                      source={{ uri: vehicle.imagenUrl }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons
                        name="car-sport-outline"
                        size={24}
                        color={colors.textSubtle}
                      />
                    </View>
                  )}

                  <View style={styles.infoCol}>
                    <View style={styles.badgesRow}>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: status.bg,
                            borderColor: status.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: status.text },
                          ]}
                        >
                          {status.label}
                        </Text>
                      </View>
                      <Tag text={typeLabel} variant="solid" />
                    </View>

                    <Text style={styles.vehicleTitle}>{vehicle.nombre}</Text>

                    <Text style={styles.metaText}>
                      Capacidad: {vehicle.capacidad} pasajeros
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(vehicle)}
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(vehicle)}
                  >
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <VehicleFormModal
        visible={modalVisible}
        editing={editingVehicle}
        onClose={() => setModalVisible(false)}
        onSave={saveVehicle}
        onDelete={removeVehicle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  addBtn: {
    height: 42,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.placeholder,
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCol: {
    flex: 1,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
  },
  vehicleTitle: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 19,
    color: colors.primary,
    marginBottom: 2,
  },
  metaText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: colors.textMuted,
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
