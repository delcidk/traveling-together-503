import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { ApiTrip, ApiVehicle, TripStatus } from "../../types/admin";
import { ApiRoute } from "../../types/route";
import { tripFormSchema, TripFormInput } from "../../schemas/adminSchemas";
import { colors } from "../../theme/colors";
import { TextField } from "../ui/TextField";
import { SelectField } from "../ui/SelectField";
import { Button } from "../ui/Button";

interface TripFormModalProps {
  visible: boolean;
  editing: ApiTrip | null;
  routes: ApiRoute[];
  vehicles: ApiVehicle[];
  onClose: () => void;
  onSave: (data: Partial<ApiTrip>, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TRIP_STATUS_OPTIONS = [
  { value: "programado", label: "Programado" },
  { value: "en_curso", label: "En Curso" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
];

export const TripFormModal = ({
  visible,
  editing,
  routes,
  vehicles,
  onClose,
  onSave,
  onDelete,
}: TripFormModalProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TripFormInput>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      rutaId: "",
      vehiculoId: "",
      conductor: "",
      fechaSalida: new Date().toISOString(),
      estado: "programado",
      asientosOcupados: "0",
    },
  });

  const fechaSalidaIso = watch("fechaSalida");

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          rutaId: editing.rutaId,
          vehiculoId: editing.vehiculoId,
          conductor: editing.conductor || "",
          fechaSalida: editing.fechaSalida || new Date().toISOString(),
          estado: editing.estado,
          asientosOcupados: String(editing.asientosOcupados ?? 0),
        });
      } else {
        reset({
          rutaId: routes[0]?.id || "",
          vehiculoId: vehicles[0]?.id || "",
          conductor: "",
          fechaSalida: new Date().toISOString(),
          estado: "programado",
          asientosOcupados: "0",
        });
      }
    }
  }, [visible, editing, routes, vehicles, reset]);

  const routeOptions = [
    { value: "", label: "Selecciona la ruta..." },
    ...routes.map((r) => ({
      value: r.id,
      label: `${r.origen} ➔ ${r.destino}`,
    })),
  ];

  const vehicleOptions = [
    { value: "", label: "Selecciona el vehículo..." },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.nombre} (Cap: ${v.capacidad} pax)`,
    })),
  ];

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selectedDate) {
      setValue("fechaSalida", selectedDate.toISOString(), {
        shouldValidate: true,
      });
    }
  };

  const formatDisplayDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Seleccionar fecha";
    return d.toLocaleDateString("es-SV", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const onSubmit = async (values: TripFormInput) => {
    try {
      const payload: Partial<ApiTrip> = {
        rutaId: values.rutaId,
        vehiculoId: values.vehiculoId,
        conductor: values.conductor?.trim() || undefined,
        fechaSalida: new Date(values.fechaSalida).toISOString(),
        estado: values.estado as TripStatus,
        asientosOcupados: Number(values.asientosOcupados || 0),
      };
      await onSave(payload, editing?.id);
      Toast.show({
        type: "success",
        text1: editing ? "Viaje actualizado" : "Viaje programado",
      });
      onClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar el viaje",
        text2: err?.message || "Revisa los campos del formulario",
      });
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(
      "Eliminar viaje",
      "¿Estás seguro de eliminar este viaje programado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(editing.id);
              Toast.show({ type: "success", text1: "Viaje eliminado" });
              onClose();
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

  const currentDateObj = fechaSalidaIso ? new Date(fechaSalidaIso) : new Date();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editing ? "EDITAR VIAJE" : "PROGRAMAR NUEVO VIAJE"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            <Controller
              control={control}
              name="rutaId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Ruta / Destino"
                  options={routeOptions}
                  value={value}
                  onChange={onChange}
                  error={errors.rutaId?.message}
                />
              )}
            />

            <View style={styles.dateFieldWrap}>
              <Text style={styles.dateLabel}>FECHA DE SALIDA</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.dateButtonText}>
                  {formatDisplayDate(fechaSalidaIso)}
                </Text>
                <Text style={styles.changeText}>Cambiar</Text>
              </TouchableOpacity>
              {errors.fechaSalida?.message ? (
                <Text style={styles.errorText}>
                  {errors.fechaSalida.message}
                </Text>
              ) : null}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={
                  Number.isNaN(currentDateObj.getTime())
                    ? new Date()
                    : currentDateObj
                }
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onDateChange}
              />
            )}

            <Controller
              control={control}
              name="vehiculoId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Vehículo Asignado"
                  options={vehicleOptions}
                  value={value}
                  onChange={onChange}
                  error={errors.vehiculoId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="conductor"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Nombre del Conductor"
                  placeholder="Ej. Juan Pérez"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.conductor?.message}
                />
              )}
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="estado"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      label="Estado"
                      options={TRIP_STATUS_OPTIONS}
                      value={value}
                      onChange={onChange}
                      error={errors.estado?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="asientosOcupados"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Ocupación Manual"
                      placeholder="0"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.asientosOcupados?.message}
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {editing ? (
              <Button
                title="Eliminar"
                variant="danger"
                onPress={confirmDelete}
                disabled={isSubmitting}
                style={styles.deleteBtn}
              />
            ) : null}
            <Button
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.cancelBtn}
            />
            <Button
              title="Guardar Viaje"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "92%",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 22,
    color: colors.primary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingVertical: 16,
  },
  dateFieldWrap: {
    marginBottom: 14,
  },
  dateLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.surface,
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  changeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  deleteBtn: {
    paddingHorizontal: 14,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
});
