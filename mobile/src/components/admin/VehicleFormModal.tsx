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
import { ApiVehicle, VehicleStatus, VehicleType } from "../../types/admin";
import {
  vehicleFormSchema,
  VehicleFormInput,
} from "../../schemas/adminSchemas";
import { colors } from "../../theme/colors";
import { TextField } from "../ui/TextField";
import { SelectField } from "../ui/SelectField";
import {
  ImagePickerField,
  MultiImagePickerField,
} from "../ui/ImagePickerField";
import { Button } from "../ui/Button";

interface VehicleFormModalProps {
  visible: boolean;
  editing: ApiVehicle | null;
  onClose: () => void;
  onSave: (data: Partial<ApiVehicle>, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const VEHICLE_TYPE_OPTIONS = [
  { value: "van", label: "Van (Minivan)" },
  { value: "microbus", label: "Microbús (15-20 pax)" },
  { value: "bus", label: "Autobús (30+ pax)" },
];

const VEHICLE_STATUS_OPTIONS = [
  { value: "disponible", label: "Disponible para viajes" },
  { value: "en_servicio", label: "En Servicio (Ocupado)" },
  { value: "mantenimiento", label: "En Mantenimiento" },
];

export const VehicleFormModal = ({
  visible,
  editing,
  onClose,
  onSave,
  onDelete,
}: VehicleFormModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormInput>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      nombre: "",
      tipo: "van",
      capacidad: "12",
      estado: "disponible",
      imagenUrl: "",
      galeria: [],
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          nombre: editing.nombre,
          tipo: editing.tipo,
          capacidad: String(editing.capacidad),
          estado: editing.estado,
          imagenUrl: editing.imagenUrl || "",
          galeria: editing.galeria || [],
        });
      } else {
        reset({
          nombre: "",
          tipo: "van",
          capacidad: "12",
          estado: "disponible",
          imagenUrl: "",
          galeria: [],
        });
      }
    }
  }, [visible, editing, reset]);

  const onSubmit = async (values: VehicleFormInput) => {
    try {
      const payload: Partial<ApiVehicle> = {
        nombre: values.nombre.trim(),
        tipo: values.tipo as VehicleType,
        capacidad: Number(values.capacidad),
        estado: values.estado as VehicleStatus,
        imagenUrl: values.imagenUrl?.trim() || undefined,
        galeria: values.galeria || [],
      };
      await onSave(payload, editing?.id);
      Toast.show({
        type: "success",
        text1: editing ? "Vehículo actualizado" : "Vehículo registrado",
      });
      onClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar el vehículo",
        text2: err?.message || "Revisa los campos del formulario",
      });
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(
      "Eliminar vehículo",
      `¿Estás seguro de que deseas eliminar el vehículo "${editing.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(editing.id);
              Toast.show({ type: "success", text1: "Vehículo eliminado" });
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
              {editing ? "EDITAR VEHÍCULO" : "NUEVO VEHÍCULO"}
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
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Modelo y Año del Vehículo"
                  placeholder="Ej. Toyota Hiace 2024"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nombre?.message}
                />
              )}
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="tipo"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      label="Tipo de Vehículo"
                      options={VEHICLE_TYPE_OPTIONS}
                      value={value}
                      onChange={onChange}
                      error={errors.tipo?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="capacidad"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Capacidad (pax)"
                      placeholder="15"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.capacidad?.message}
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
                  label="Estado Operativo Actual"
                  options={VEHICLE_STATUS_OPTIONS}
                  value={value}
                  onChange={onChange}
                  error={errors.estado?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="imagenUrl"
              render={({ field: { onChange, value } }) => (
                <ImagePickerField
                  label="Fotografía Principal (Portada)"
                  value={value}
                  onChange={onChange}
                  error={errors.imagenUrl?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="galeria"
              render={({ field: { onChange, value } }) => (
                <MultiImagePickerField
                  label="Galería de Fotos Adicionales"
                  value={value}
                  onChange={onChange}
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
              title="Guardar Vehículo"
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
