import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ApiRoute } from "../../types/route";
import { ApiReservation, ApiTrip, ApiVehicle } from "../../types/admin";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { DEFAULT_CAPACITY, buildWhatsAppUrl } from "../../config/constants";
import { buildQuoteMessage } from "../../utils/routeHelpers";
import {
  subscribeScheduledTripsByRoute,
  subscribeVehicles,
} from "../../services/firestore";
import { fetchApi, authHeaders } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface QuoteModalProps {
  visible: boolean;
  route: ApiRoute | null;
  onClose: () => void;
}

type ModalMode = "scheduled" | "private";

export const QuoteModal = ({ visible, route, onClose }: QuoteModalProps) => {
  const router = useRouter();
  const { user, userProfile, getToken } = useAuth();

  const [mode, setMode] = useState<ModalMode>("scheduled");
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>("");

  const [pasajeros, setPasajeros] = useState(1);
  const [telefono, setTelefono] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (userProfile?.telefono && !telefono) {
      setTelefono(userProfile.telefono);
    }
  }, [userProfile?.telefono, telefono]);

  useEffect(() => {
    if (!visible || !route?.id) return;

    setLoadingTrips(true);
    setPasajeros(1);

    const loadFallback = async () => {
      try {
        const [tripList, vehicleList] = await Promise.all([
          fetchApi<ApiTrip[]>(`/api/trips?rutaId=${route.id}&estado=programado`).catch(
            () => [] as ApiTrip[]
          ),
          fetchApi<ApiVehicle[]>("/api/vehicles").catch(() => [] as ApiVehicle[]),
        ]);
        setTrips(tripList || []);
        setVehicles(vehicleList || []);
        if (tripList && tripList.length > 0) {
          setSelectedTripId((prev) =>
            prev && tripList.some((t) => t.id === prev) ? prev : tripList[0].id
          );
        }
      } finally {
        setLoadingTrips(false);
      }
    };

    const unsubTrips = subscribeScheduledTripsByRoute(
      route.id,
      (liveTrips) => {
        setTrips(liveTrips);
        setLoadingTrips(false);
        if (liveTrips.length > 0) {
          setSelectedTripId((prev) =>
            prev && liveTrips.some((t) => t.id === prev) ? prev : liveTrips[0].id
          );
        } else {
          setSelectedTripId("");
        }
      },
      () => {
        loadFallback();
      }
    );

    const unsubVehicles = subscribeVehicles(
      (liveVehicles) => {
        setVehicles(liveVehicles);
      },
      () => {}
    );

    return () => {
      unsubTrips();
      unsubVehicles();
    };
  }, [visible, route?.id]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, ApiVehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const maxSeatsForSelectedTrip = useMemo(() => {
    if (!selectedTrip) return DEFAULT_CAPACITY;
    const veh = vehicleMap.get(selectedTrip.vehiculoId);
    const capacidad = veh?.capacidad || DEFAULT_CAPACITY;
    return Math.max(0, capacidad - Number(selectedTrip.asientosOcupados || 0));
  }, [selectedTrip, vehicleMap]);

  useEffect(() => {
    if (mode === "scheduled" && maxSeatsForSelectedTrip > 0 && pasajeros > maxSeatsForSelectedTrip) {
      setPasajeros(maxSeatsForSelectedTrip);
    }
  }, [mode, maxSeatsForSelectedTrip, pasajeros]);

  if (!route) return null;

  const maxPasajeros =
    mode === "scheduled"
      ? Math.max(1, maxSeatsForSelectedTrip)
      : DEFAULT_CAPACITY;

  const handleIncrement = () => {
    if (pasajeros < maxPasajeros) {
      setPasajeros((p) => p + 1);
    }
  };

  const handleDecrement = () => {
    if (pasajeros > 1) {
      setPasajeros((p) => p - 1);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTripDateTime = (iso: string): string => {
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

  const total = (route.tarifaBase * pasajeros).toFixed(2);

  const handleCreateReservation = async () => {
    if (!user) {
      Alert.alert("Sesión requerida", "Inicia sesión para realizar una reserva.");
      return;
    }
    if (!selectedTrip) {
      Alert.alert(
        "Selecciona una salida",
        "Elige uno de los viajes programados disponibles."
      );
      return;
    }
    if (maxSeatsForSelectedTrip < pasajeros) {
      Alert.alert(
        "Cupo insuficiente",
        `Solo quedan ${maxSeatsForSelectedTrip} asientos disponibles en este viaje.`
      );
      return;
    }

    const cleanPhone = telefono.trim();
    if (!cleanPhone) {
      Alert.alert(
        "Teléfono requerido",
        "Ingresa un número de teléfono de contacto para confirmar tu reserva."
      );
      return;
    }

    const clienteNombre =
      userProfile?.nombre?.trim() ||
      user.displayName?.trim() ||
      user.email?.split("@")[0] ||
      "Cliente";

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("Tu sesión ha expirado. Vuelve a iniciar sesión.");

      await fetchApi<ApiReservation>("/api/reservations", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          viajeId: selectedTrip.id,
          userId: user.uid,
          clienteNombre,
          clienteTelefono: cleanPhone,
          pasajeros,
          precioTotal: Number((route.tarifaBase * pasajeros).toFixed(2)),
        }),
      });

      onClose();
      Alert.alert(
        "¡Reserva creada!",
        `Tu solicitud para ${route.origen} → ${route.destino} (${pasajeros} pasajero${
          pasajeros > 1 ? "s" : ""
        }) quedó registrada en estado Pendiente.`,
        [
          {
            text: "Ver Mis Reservas",
            onPress: () => router.push("/(app)/my-reservations"),
          },
          { text: "Cerrar", style: "cancel" },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "No se pudo completar la reserva",
        err?.message || "Ocurrió un error al registrar tu reservación."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsApp = async () => {
    const dateStr = formatDateString(date);
    const message = buildQuoteMessage(route, pasajeros, dateStr);
    const url = buildWhatsAppUrl(message);

    try {
      await Linking.openURL(url);
      onClose();
    } catch (err) {
      console.error("Error abriendo WhatsApp:", err);
      Alert.alert(
        "WhatsApp no disponible",
        "No se pudo abrir WhatsApp en este dispositivo."
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {mode === "scheduled"
                  ? "RESERVAR SALIDA PROGRAMADA"
                  : "COTIZAR VIAJE PRIVADO"}
              </Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {route.origen} ➔ {route.destino}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Selector de Modo */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === "scheduled" && styles.tabBtnActive,
              ]}
              onPress={() => setMode("scheduled")}
            >
              <Ionicons
                name="calendar"
                size={15}
                color={mode === "scheduled" ? "#FFFFFF" : colors.primary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  mode === "scheduled" && styles.tabBtnTextActive,
                ]}
              >
                Salidas ({trips.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === "private" && styles.tabBtnActive,
              ]}
              onPress={() => setMode("private")}
            >
              <Ionicons
                name="logo-whatsapp"
                size={15}
                color={mode === "private" ? "#FFFFFF" : colors.whatsapp}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  mode === "private" && styles.tabBtnTextActive,
                ]}
              >
                Viaje Privado
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
          >
            {mode === "scheduled" ? (
              <>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    SELECCIONA UN VIAJE DISPONIBLE
                  </Text>
                  {loadingTrips ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.loadingText}>
                        Buscando salidas programadas...
                      </Text>
                    </View>
                  ) : trips.length === 0 ? (
                    <View style={styles.emptyTripsBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={22}
                        color={colors.textMuted}
                      />
                      <Text style={styles.emptyTripsText}>
                        No hay salidas grupales programadas para esta ruta en
                        este momento. Puedes cotizar un viaje privado en la
                        pestaña &quot;Viaje Privado&quot;.
                      </Text>
                      <TouchableOpacity
                        style={styles.switchModeBtn}
                        onPress={() => setMode("private")}
                      >
                        <Text style={styles.switchModeBtnText}>
                          Cotizar viaje privado por WhatsApp →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.tripList}>
                      {trips.map((trip) => {
                        const veh = vehicleMap.get(trip.vehiculoId);
                        const capacidad = veh?.capacidad || DEFAULT_CAPACITY;
                        const disponibles = Math.max(
                          0,
                          capacidad - Number(trip.asientosOcupados || 0)
                        );
                        const isSelected = trip.id === selectedTripId;
                        const soldOut = disponibles <= 0;

                        return (
                          <TouchableOpacity
                            key={trip.id}
                            style={[
                              styles.tripOption,
                              isSelected && styles.tripOptionSelected,
                              soldOut && styles.tripOptionDisabled,
                            ]}
                            onPress={() => !soldOut && setSelectedTripId(trip.id)}
                            disabled={soldOut}
                            activeOpacity={0.75}
                          >
                            <View style={styles.tripOptionLeft}>
                              <View style={styles.tripDateRow}>
                                <Ionicons
                                  name={
                                    isSelected
                                      ? "radio-button-on"
                                      : "radio-button-off"
                                  }
                                  size={18}
                                  color={
                                    soldOut
                                      ? colors.textSubtle
                                      : colors.primary
                                  }
                                />
                                <Text style={styles.tripDateText}>
                                  {formatTripDateTime(trip.fechaSalida)}
                                </Text>
                              </View>
                              <Text style={styles.tripMetaText}>
                                {veh ? `${veh.nombre} (${veh.tipo.toUpperCase()})` : "Transporte asignado"}
                                {trip.conductor ? ` • Cond: ${trip.conductor}` : ""}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.seatsBadge,
                                soldOut && styles.seatsBadgeSoldOut,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.seatsBadgeText,
                                  soldOut && styles.seatsBadgeTextSoldOut,
                                ]}
                              >
                                {soldOut ? "Agotado" : `${disponibles} disp.`}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {trips.length > 0 && selectedTrip && (
                  <>
                    {/* Selector de Pasajeros */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>
                        PASAJEROS (DISPONIBLES: {maxSeatsForSelectedTrip})
                      </Text>
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={[
                            styles.counterBtn,
                            pasajeros <= 1 && styles.counterBtnDisabled,
                          ]}
                          onPress={handleDecrement}
                          disabled={pasajeros <= 1}
                        >
                          <Ionicons
                            name="remove"
                            size={20}
                            color={
                              pasajeros <= 1 ? colors.textSubtle : colors.primary
                            }
                          />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{pasajeros}</Text>
                        <TouchableOpacity
                          style={[
                            styles.counterBtn,
                            pasajeros >= maxPasajeros && styles.counterBtnDisabled,
                          ]}
                          onPress={handleIncrement}
                          disabled={pasajeros >= maxPasajeros}
                        >
                          <Ionicons
                            name="add"
                            size={20}
                            color={
                              pasajeros >= maxPasajeros
                                ? colors.textSubtle
                                : colors.primary
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Teléfono de contacto */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>TELÉFONO DE CONTACTO</Text>
                      <TextInput
                        style={styles.phoneInput}
                        value={telefono}
                        onChangeText={setTelefono}
                        placeholder="Ej: +503 7000-0000"
                        placeholderTextColor={colors.textSubtle}
                        keyboardType="phone-pad"
                      />
                    </View>

                    {/* Resumen de Total */}
                    <View style={styles.totalContainer}>
                      <View>
                        <Text style={styles.totalLabel}>Total a pagar:</Text>
                        <Text style={styles.totalSub}>
                          ${route.tarifaBase.toFixed(2)} × {pasajeros} persona
                          {pasajeros > 1 ? "s" : ""}
                        </Text>
                      </View>
                      <Text style={styles.totalValue}>${total} USD</Text>
                    </View>

                    <Button
                      title={
                        submitting ? "Registrando reserva..." : "Confirmar reserva"
                      }
                      onPress={handleCreateReservation}
                      loading={submitting}
                      disabled={submitting || maxSeatsForSelectedTrip < 1}
                      style={styles.submitBtn}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {/* Selector de Pasajeros */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    PASAJEROS (MÁX. {DEFAULT_CAPACITY})
                  </Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={[
                        styles.counterBtn,
                        pasajeros <= 1 && styles.counterBtnDisabled,
                      ]}
                      onPress={handleDecrement}
                      disabled={pasajeros <= 1}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={
                          pasajeros <= 1 ? colors.textSubtle : colors.primary
                        }
                      />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{pasajeros}</Text>
                    <TouchableOpacity
                      style={[
                        styles.counterBtn,
                        pasajeros >= DEFAULT_CAPACITY && styles.counterBtnDisabled,
                      ]}
                      onPress={handleIncrement}
                      disabled={pasajeros >= DEFAULT_CAPACITY}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={
                          pasajeros >= DEFAULT_CAPACITY
                            ? colors.textSubtle
                            : colors.primary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Selector de Fecha */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>FECHA DESEADA DE VIAJE</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowPicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.dateText}>{formatDateString(date)}</Text>
                    <Text style={styles.dateChangeLabel}>Cambiar</Text>
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    minimumDate={new Date()}
                    onChange={onDateChange}
                  />
                )}

                {/* Resumen de Total */}
                <View style={styles.totalContainer}>
                  <View>
                    <Text style={styles.totalLabel}>Cotización total:</Text>
                    <Text style={styles.totalSub}>
                      ${route.tarifaBase.toFixed(2)} × {pasajeros} persona
                      {pasajeros > 1 ? "s" : ""}
                    </Text>
                  </View>
                  <Text style={styles.totalValue}>${total} USD</Text>
                </View>

                <Button
                  title="Enviar cotización por WhatsApp"
                  variant="whatsapp"
                  icon={
                    <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                  }
                  onPress={handleSendWhatsApp}
                  style={styles.submitBtn}
                />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 440,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollArea: {
    maxHeight: 480,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 22,
    color: colors.primary,
  },
  routeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: colors.primary,
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyTripsBox: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  emptyTripsText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  switchModeBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  switchModeBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  tripList: {
    gap: 8,
  },
  tripOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tripOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F3F4F6",
  },
  tripOptionDisabled: {
    opacity: 0.5,
  },
  tripOptionLeft: {
    flex: 1,
    paddingRight: 8,
  },
  tripDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tripDateText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  tripMetaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 24,
    marginTop: 2,
  },
  seatsBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  seatsBadgeSoldOut: {
    backgroundColor: "#FEE2E2",
  },
  seatsBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "#15803D",
  },
  seatsBadgeTextSoldOut: {
    color: "#B91C1C",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignSelf: "flex-start",
  },
  counterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.primary,
    backgroundColor: colors.surface,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: colors.primary,
  },
  dateChangeLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.textMuted,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
  },
  totalSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.textMuted,
    marginTop: 2,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: "BarlowCondensed_800ExtraBold",
    color: colors.primary,
  },
  submitBtn: {
    width: "100%",
  },
});
