import React, { useEffect } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { ApiReservation, ApiTrip, ApiUser } from "../../types/admin";
import { ApiRoute } from "../../types/route";
import {
  reservationFormSchema,
  ReservationFormInput,
} from "../../schemas/adminSchemas";
import { colors } from "../../theme/colors";
import { TextField } from "../ui/TextField";
import { SelectField } from "../ui/SelectField";
import { Button } from "../ui/Button";
import { formatTripDate } from "../../utils/adminHelpers";

interface ReservationFormModalProps {
  visible: boolean;
  editing: ApiReservation | null;
  trips: ApiTrip[];
  routes: ApiRoute[];
  users: ApiUser[];
  onClose: () => void;
  onSave: (data: Partial<ApiReservation>, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "pagada", label: "Pagada" },
  { value: "cancelada", label: "Cancelada" },
];

export const ReservationFormModal = ({
  visible,
  editing,
  trips,
  routes,
  users,
  onClose,
  onSave,
  onDelete,
}: ReservationFormModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormInput>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      viajeId: "",
      userId: "",
      clienteNombre: "",
      clienteTelefono: "",
      pasajeros: "1",
      precioTotal: "",
      estado: "pendiente",
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          viajeId: editing.viajeId,
          userId: editing.userId || "",
          clienteNombre: editing.clienteNombre,
          clienteTelefono: editing.clienteTelefono || "",
          pasajeros: String(editing.pasajeros),
          precioTotal: String(editing.precioTotal),
          estado: editing.estado,
        });
      } else {
        reset({
          viajeId: "",
          userId: "",
          clienteNombre: "",
          clienteTelefono: "",
          pasajeros: "1",
          precioTotal: "",
          estado: "pendiente",
        });
      }
    }
  }, [visible, editing, reset]);

  const watchViajeId = watch("viajeId");
  const watchPasajeros = watch("pasajeros");

  // Sugerir precioTotal cuando cambia viaje o pasajeros (al crear nueva reserva)
  useEffect(() => {
    if (!editing && watchViajeId) {
      const trip = trips.find((t) => t.id === watchViajeId);
      if (trip) {
        const route = routes.find((r) => r.id === trip.rutaId);
        const pax = parseInt(watchPasajeros, 10);
        if (route && !isNaN(pax) && pax >= 1) {
          setValue("precioTotal", (route.tarifaBase * pax).toFixed(2));
        }
      }
    }
  }, [watchViajeId, watchPasajeros, editing, trips, routes, setValue]);

  const tripOptions = trips
    .filter((t) => t.estado !== "cancelado" || t.id === editing?.viajeId)
    .map((t) => {
      const route = routes.find((r) => r.id === t.rutaId);
      const label = `${formatTripDate(t.fechaSalida)} - ${
        route ? `${route.origen} a ${route.destino}` : "Ruta"
      } (${t.asientosOcupados} ocupados)`;
      return { value: t.id, label };
    });

  const userOptions = [
    { value: "", label: "(Ninguno - Reserva como Invitado)" },
    ...users.map((u) => ({
      value: u.uid,
      label: `${u.nombre} (${u.email})`,
    })),
  ];

  const handleUserSelect = (uid: string, onChange: (val: string) => void) => {
    onChange(uid);
    if (uid) {
      const found = users.find((u) => u.uid === uid);
      if (found) {
        setValue("clienteNombre", found.nombre, { shouldValidate: true });
        if (found.telefono) {
          setValue("clienteTelefono", found.telefono, { shouldValidate: true });
        }
      }
    }
  };

  const onSubmit = async (values: ReservationFormInput) => {
    try {
      const payload: Partial<ApiReservation> = {
        viajeId: values.viajeId,
        userId: values.userId || undefined,
        clienteNombre: values.clienteNombre.trim(),
        clienteTelefono: values.clienteTelefono?.trim() || undefined,
        pasajeros: parseInt(values.pasajeros, 10),
        precioTotal: Number(values.precioTotal),
        estado: values.estado,
      };
      await onSave(payload, editing?.id);
      Toast.show({
        type: "success",
        text1: editing ? "Reserva actualizada" : "Reserva creada",
      });
      onClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: err?.message || "Revisa los datos ingresados",
      });
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(
      "Eliminar reserva",
      `¿Estás seguro de eliminar la reserva de ${editing.clienteNombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(editing.id);
              Toast.show({ type: "success", text1: "Reserva eliminada" });
              onClose();
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
              {editing ? "EDITAR RESERVA" : "AGREGAR RESERVA MANUAL"}
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
              name="viajeId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Viaje Programado"
                  placeholder="Selecciona el viaje..."
                  options={tripOptions}
                  value={value}
                  onChange={onChange}
                  error={errors.viajeId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="userId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Asociar a un usuario (Opcional)"
                  options={userOptions}
                  value={value}
                  onChange={(uid) => handleUserSelect(uid, onChange)}
                />
              )}
            />

            <Controller
              control={control}
              name="clienteNombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Nombre del Cliente"
                  placeholder="Ej. Carlos Martínez"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.clienteNombre?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="clienteTelefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Teléfono / WhatsApp"
                  placeholder="+503 7890-1234"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.clienteTelefono?.message}
                />
              )}
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="pasajeros"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Pasajeros"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.pasajeros?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="precioTotal"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Cobro Total ($)"
                      keyboardType="decimal-pad"
                      placeholder="45.00"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.precioTotal?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="estado"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Estado de la Reserva"
                  options={STATUS_OPTIONS}
                  value={value}
                  onChange={onChange}
                  error={errors.estado?.message}
                />
              )}
            />
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
              title="Guardar"
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
    maxHeight: "90%",
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
