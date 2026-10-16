import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { ApiRoute } from "../../types/route";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { DEFAULT_CAPACITY, buildWhatsAppUrl } from "../../config/constants";
import { buildQuoteMessage } from "../../utils/routeHelpers";

interface QuoteModalProps {
  visible: boolean;
  route: ApiRoute | null;
  onClose: () => void;
}

export const QuoteModal = ({ visible, route, onClose }: QuoteModalProps) => {
  const [pasajeros, setPasajeros] = useState(1);
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  if (!route) return null;

  const handleIncrement = () => {
    if (pasajeros < DEFAULT_CAPACITY) {
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

  const total = (route.tarifaBase * pasajeros).toFixed(2);

  const handleSendWhatsApp = async () => {
    const dateStr = formatDateString(date);
    const message = buildQuoteMessage(route, pasajeros, dateStr);
    const url = buildWhatsAppUrl(message);

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onClose();
      } else {
        await Linking.openURL(url);
        onClose();
      }
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
              <Text style={styles.title}>COTIZAR VIAJE PRIVADO</Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {route.origen} ➔ {route.destino}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Selector de Pasajeros */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>PASAJEROS (MÁX. {DEFAULT_CAPACITY})</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, pasajeros <= 1 && styles.counterBtnDisabled]}
                onPress={handleDecrement}
                disabled={pasajeros <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={pasajeros <= 1 ? colors.textSubtle : colors.primary}
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
                  color={pasajeros >= DEFAULT_CAPACITY ? colors.textSubtle : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Selector de Fecha */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>FECHA DE VIAJE</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
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
                ${route.tarifaBase.toFixed(2)} × {pasajeros} persona{pasajeros > 1 ? "s" : ""}
              </Text>
            </View>
            <Text style={styles.totalValue}>${total} USD</Text>
          </View>

          {/* Botón WhatsApp */}
          <Button
            title="Enviar cotización por WhatsApp"
            variant="whatsapp"
            icon={<Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />}
            onPress={handleSendWhatsApp}
            style={styles.submitBtn}
          />
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
    padding: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
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
    marginTop: 8,
    marginBottom: 20,
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
