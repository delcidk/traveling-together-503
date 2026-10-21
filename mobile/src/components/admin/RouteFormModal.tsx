import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { ApiRoute, RouteCategory } from "../../types/route";
import { routeFormSchema, RouteFormInput } from "../../schemas/adminSchemas";
import { colors } from "../../theme/colors";
import { TextField } from "../ui/TextField";
import { SelectField } from "../ui/SelectField";
import {
  ImagePickerField,
  MultiImagePickerField,
} from "../ui/ImagePickerField";
import { Button } from "../ui/Button";

interface RouteFormModalProps {
  visible: boolean;
  editing: ApiRoute | null;
  onClose: () => void;
  onSave: (data: Partial<ApiRoute>, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "(Sin categoría)" },
  { value: "playa", label: "Playa" },
  { value: "internacional", label: "Internacional" },
  { value: "aeropuerto", label: "Aeropuerto" },
  { value: "ciudad", label: "Ciudad" },
  { value: "escenico", label: "Escénico" },
];

export const RouteFormModal = ({
  visible,
  editing,
  onClose,
  onSave,
  onDelete,
}: RouteFormModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RouteFormInput>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      origen: "",
      destino: "",
      tarifaBase: "0",
      distanciaKm: "1",
      descripcion: "",
      imagenUrl: "",
      galeria: [],
      categoria: "",
      activa: true,
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          origen: editing.origen,
          destino: editing.destino,
          tarifaBase: String(editing.tarifaBase),
          distanciaKm: String(editing.distanciaKm),
          descripcion: editing.descripcion || "",
          imagenUrl: editing.imagenUrl || "",
          galeria: editing.galeria || [],
          categoria: editing.categoria || "",
          activa: editing.activa,
        });
      } else {
        reset({
          origen: "",
          destino: "",
          tarifaBase: "",
          distanciaKm: "",
          descripcion: "",
          imagenUrl: "",
          galeria: [],
          categoria: "",
          activa: true,
        });
      }
    }
  }, [visible, editing, reset]);

  const onSubmit = async (values: RouteFormInput) => {
    try {
      const payload: Partial<ApiRoute> = {
        origen: values.origen.trim(),
        destino: values.destino.trim(),
        tarifaBase: Number(values.tarifaBase),
        distanciaKm: Number(values.distanciaKm),
        descripcion: values.descripcion?.trim() || undefined,
        imagenUrl: values.imagenUrl?.trim() || undefined,
        galeria: values.galeria || [],
        categoria: (values.categoria || undefined) as RouteCategory | undefined,
        activa: values.activa,
      };
      await onSave(payload, editing?.id);
      Toast.show({
        type: "success",
        text1: editing ? "Ruta actualizada" : "Ruta creada",
      });
      onClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar la ruta",
        text2: err?.message || "Revisa los campos del formulario",
      });
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(
      "Eliminar ruta",
      `¿Estás seguro de que deseas eliminar la ruta "${editing.origen} ➔ ${editing.destino}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(editing.id);
              Toast.show({ type: "success", text1: "Ruta eliminada" });
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
              {editing ? "EDITAR RUTA" : "NUEVA RUTA"}
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
              name="origen"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Ciudad de Origen"
                  placeholder="Ej. San Salvador"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.origen?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="destino"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Lugar de Destino"
                  placeholder="Ej. El Tunco, La Libertad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.destino?.message}
                />
              )}
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="tarifaBase"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Tarifa Base ($)"
                      placeholder="45.00"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.tarifaBase?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="distanciaKm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Distancia (Km)"
                      placeholder="40.5"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.distanciaKm?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="categoria"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Categoría"
                  options={CATEGORY_OPTIONS}
                  value={value}
                  onChange={onChange}
                  error={errors.categoria?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Descripción / Recomendaciones"
                  placeholder="Tour privado con paradas en miradores..."
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.descripcion?.message}
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

            <Controller
              control={control}
              name="activa"
              render={({ field: { onChange, value } }) => (
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>Ruta Activa (Visible)</Text>
                    <Text style={styles.switchSub}>
                      Mostrar esta ruta en el catálogo público
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
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
              title="Guardar Ruta"
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
  textarea: {
    height: 82,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  switchTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  switchSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
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
