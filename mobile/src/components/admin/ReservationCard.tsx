import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApiReservation, ApiTrip, ReservationStatus } from "../../types/admin";
import { ApiRoute } from "../../types/route";
import { colors } from "../../theme/colors";
import {
  reservationCode,
  statusLabel,
  resolveReservation,
  allowedTransitions,
} from "../../utils/adminHelpers";

interface ReservationCardProps {
  reservation: ApiReservation;
  trips: ApiTrip[];
  routes: ApiRoute[];
  onChangeStatus: (id: string, status: ReservationStatus) => Promise<void>;
  onEdit: (reservation: ApiReservation) => void;
}

export const ReservationCard = ({
  reservation,
  trips,
  routes,
  onChangeStatus,
  onEdit,
}: ReservationCardProps) => {
  const [updatingStatus, setUpdatingStatus] = useState<ReservationStatus | null>(
    null
  );

  const { rutaLabel, fecha } = resolveReservation(reservation, trips, routes);
  const transitions = allowedTransitions(reservation.estado);

  const handleTransition = async (status: ReservationStatus) => {
    try {
      setUpdatingStatus(status);
      await onChangeStatus(reservation.id, status);
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onEdit(reservation)}
      activeOpacity={0.85}
    >
      {/* Fila superior: Código + Badge Estado + Cobro Total */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <Text style={styles.codeText}>{reservationCode(reservation.id)}</Text>
          <View
            style={[
              styles.statusBadge,
              reservation.estado === "confirmada" && styles.badgeConfirmed,
              reservation.estado === "pagada" && styles.badgePaid,
              reservation.estado === "cancelada" && styles.badgeCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                reservation.estado === "cancelada" && styles.badgeTextCancelled,
              ]}
            >
              {statusLabel(reservation.estado)}
            </Text>
          </View>
        </View>
        <Text style={styles.priceText}>
          ${Number(reservation.precioTotal).toFixed(2)}
        </Text>
      </View>

      {/* Ruta */}
      <Text style={styles.routeTitle}>{rutaLabel}</Text>

      {/* Cliente */}
      <Text style={styles.clientName}>{reservation.clienteNombre}</Text>

      {/* Teléfono y Fecha */}
      <View style={styles.infoRow}>
        {reservation.clienteTelefono ? (
          <Text style={styles.infoText}>{reservation.clienteTelefono}</Text>
        ) : (
          <Text style={styles.infoText}>Sin teléfono</Text>
        )}
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.infoText}>{fecha}</Text>
        </View>
      </View>

      {/* Pasajeros */}
      <View style={styles.passengersRow}>
        <Ionicons name="people" size={15} color="#4B5563" />
        <Text style={styles.infoText}>
          {reservation.pasajeros}{" "}
          {reservation.pasajeros === 1 ? "pasajero" : "pasajeros"}
        </Text>
      </View>

      {/* Botones de transición de estado */}
      <View style={styles.actionsRow}>
        {transitions.map((t) => {
          const isCancel = t.status === "cancelada";
          const isConfirm = t.status === "confirmada";
          const isBusy = updatingStatus === t.status;

          return (
            <TouchableOpacity
              key={t.status}
              style={[
                styles.actionBtn,
                isConfirm && styles.actionBtnConfirm,
                isCancel && styles.actionBtnCancel,
              ]}
              onPress={() => handleTransition(t.status)}
              disabled={updatingStatus !== null}
            >
              {isBusy ? (
                <ActivityIndicator
                  size="small"
                  color={isCancel ? colors.danger : colors.primary}
                />
              ) : (
                <Text
                  style={[
                    styles.actionBtnText,
                    isConfirm && styles.actionBtnTextConfirm,
                    isCancel && styles.actionBtnTextCancel,
                  ]}
                >
                  {t.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badgeConfirmed: {
    borderColor: colors.primary,
  },
  badgePaid: {
    borderColor: colors.whatsapp,
  },
  badgeCancelled: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  statusBadgeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.primary,
  },
  badgeTextCancelled: {
    color: colors.danger,
  },
  priceText: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 18,
    color: colors.primary,
  },
  routeTitle: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 20,
    color: colors.primary,
    marginBottom: 4,
  },
  clientName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: colors.primary,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
  },
  passengersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnConfirm: {
    borderColor: colors.primary,
  },
  actionBtnCancel: {
    borderColor: "#FCA5A5",
  },
  actionBtnText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.textMuted,
  },
  actionBtnTextConfirm: {
    color: colors.primary,
  },
  actionBtnTextCancel: {
    color: colors.danger,
  },
});
