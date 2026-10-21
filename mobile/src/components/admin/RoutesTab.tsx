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
import { ApiRoute } from "../../types/route";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { Tag } from "../ui/Tag";
import { EmptyState } from "../ui/EmptyState";
import { RouteFormModal } from "./RouteFormModal";
import { CATEGORY_LABELS } from "../../config/constants";

export const RoutesTab = () => {
  const { routes, saveRoute, removeRoute } = useAdmin();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ApiRoute | null>(null);

  const handleOpenCreate = () => {
    setEditingRoute(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (route: ApiRoute) => {
    setEditingRoute(route);
    setModalVisible(true);
  };

  const handleDelete = (route: ApiRoute) => {
    Alert.alert(
      "Eliminar ruta",
      `¿Estás seguro de que deseas eliminar la ruta hacia "${route.destino}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeRoute(route.id);
              Toast.show({ type: "success", text1: "Ruta eliminada" });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error al eliminar",
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
        title="Agregar Ruta"
        icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
        onPress={handleOpenCreate}
        style={styles.addBtn}
      />

      {routes.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="No hay rutas registradas"
          description="Agrega tu primera ruta turística para que aparezca en el catálogo."
          actionTitle="Agregar Ruta"
          onAction={handleOpenCreate}
        />
      ) : (
        <View>
          {routes.map((route) => {
            const catLabel = route.categoria
              ? CATEGORY_LABELS[route.categoria] || route.categoria
              : null;

            return (
              <View
                key={route.id}
                style={[styles.card, !route.activa && styles.cardInactive]}
              >
                <View style={styles.row}>
                  {route.imagenUrl ? (
                    <Image
                      source={{ uri: route.imagenUrl }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={22}
                        color={colors.textSubtle}
                      />
                    </View>
                  )}

                  <View style={styles.infoCol}>
                    <View style={styles.badgesRow}>
                      <View
                        style={[
                          styles.statusPill,
                          route.activa
                            ? styles.statusPillActive
                            : styles.statusPillInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            route.activa
                              ? styles.statusTextActive
                              : styles.statusTextInactive,
                          ]}
                        >
                          {route.activa ? "Activa" : "Inactiva"}
                        </Text>
                      </View>
                      {catLabel ? (
                        <Tag text={catLabel} variant="solid" />
                      ) : null}
                    </View>

                    <Text style={styles.routeTitle}>
                      {route.origen} ➔ {route.destino}
                    </Text>

                    <Text style={styles.metaText}>
                      ${Number(route.tarifaBase).toFixed(2)} USD ·{" "}
                      {route.distanciaKm} km
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(route)}
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(route)}
                  >
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <RouteFormModal
        visible={modalVisible}
        editing={editingRoute}
        onClose={() => setModalVisible(false)}
        onSave={saveRoute}
        onDelete={removeRoute}
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
  cardInactive: {
    opacity: 0.72,
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
  statusPillActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  statusPillInactive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  statusPillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
  },
  statusTextActive: {
    color: "#047857",
  },
  statusTextInactive: {
    color: colors.danger,
  },
  routeTitle: {
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
