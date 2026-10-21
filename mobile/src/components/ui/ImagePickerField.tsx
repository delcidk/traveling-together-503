import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { uploadImageToImgBB } from "../../services/imageUpload";

interface ImagePickerFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  error?: string;
}

export const ImagePickerField = ({
  label,
  value,
  onChange,
  error,
}: ImagePickerFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePick = async () => {
    try {
      setUploadError(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setUploadError("Se requiere permiso para acceder a la galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setUploading(true);
      const url = await uploadImageToImgBB(result.assets[0].base64);
      onChange(url);
    } catch (err: any) {
      setUploadError(err?.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {value ? (
        <View style={styles.previewBox}>
          <Image
            source={{ uri: value }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handlePick}
              disabled={uploading}
            >
              <Text style={styles.actionBtnText}>Cambiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.dangerBtn]}
              onPress={() => onChange("")}
              disabled={uploading}
            >
              <Text style={styles.dangerBtnText}>Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.dropzone}
          onPress={handlePick}
          disabled={uploading}
          activeOpacity={0.7}
        >
          {uploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.uploadingText}>Subiendo a ImgBB...</Text>
            </View>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={28}
                color={colors.textMuted}
              />
              <Text style={styles.dropzoneTitle}>
                Toca para seleccionar una foto
              </Text>
              <Text style={styles.dropzoneSub}>JPG o PNG desde tu galería</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {uploadError || error ? (
        <Text style={styles.errorText}>{uploadError || error}</Text>
      ) : null}
    </View>
  );
};

interface MultiImagePickerFieldProps {
  label: string;
  value?: string[];
  onChange: (urls: string[]) => void;
}

export const MultiImagePickerField = ({
  label,
  value = [],
  onChange,
}: MultiImagePickerFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAdd = async () => {
    try {
      setUploadError(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setUploadError("Se requiere permiso para acceder a la galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.75,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setUploading(true);
      const url = await uploadImageToImgBB(result.assets[0].base64);
      onChange([...value, url]);
    } catch (err: any) {
      setUploadError(err?.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryRow}
      >
        {value.map((url, idx) => (
          <View key={`${url}-${idx}`} style={styles.thumbWrapper}>
            <Image source={{ uri: url }} style={styles.thumbImage} />
            <TouchableOpacity
              style={styles.removeBadge}
              onPress={() => handleRemove(idx)}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addThumbBtn}
          onPress={handleAdd}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="add" size={24} color={colors.textMuted} />
              <Text style={styles.addThumbText}>Agregar</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {uploadError ? (
        <Text style={styles.errorText}>{uploadError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: colors.primary,
    marginBottom: 6,
  },
  dropzone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dropzoneTitle: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: colors.primary,
    marginTop: 6,
  },
  dropzoneSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.textMuted,
    marginTop: 2,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.textMuted,
  },
  previewBox: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  previewImage: {
    width: "100%",
    height: 150,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    padding: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.primary,
  },
  dangerBtn: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  dangerBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.danger,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.danger,
    marginTop: 4,
  },
  galleryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  thumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  addThumbBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  addThumbText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: colors.textMuted,
    marginTop: 2,
  },
});
