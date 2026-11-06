import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { ScreenContainer } from "../../src/components/ui/ScreenContainer";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { Tag } from "../../src/components/ui/Tag";
import { SectionLabel } from "../../src/components/ui/SectionLabel";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme/colors";

const ProfileSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d+\s\-]{8,15}$/.test(val), {
      message: "Teléfono inválido",
    }),
});

type ProfileForm = z.infer<typeof ProfileSchema>;

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof PasswordSchema>;

export default function ProfileScreen() {
  const {
    user,
    userProfile,
    profileError,
    isAdmin,
    emailVerified,
    isPasswordProvider,
    retryProfile,
    updateUserProfile,
    changePassword,
    sendVerificationEmail,
    refreshUser,
    logout,
  } = useAuth();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [retryingProfile, setRetryingProfile] = useState(false);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      nombre: userProfile?.nombre || user?.displayName || "",
      telefono: userProfile?.telefono || "",
    },
  });

  useEffect(() => {
    resetProfileForm({
      nombre: userProfile?.nombre || user?.displayName || "",
      telefono: userProfile?.telefono || "",
    });
  }, [userProfile, user?.displayName, resetProfileForm]);

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      setSavingProfile(true);
      await updateUserProfile({
        nombre: data.nombre,
        telefono: data.telefono,
      });
      Toast.show({
        type: "success",
        text1: "Perfil actualizado",
        text2: "Tus datos se guardaron correctamente",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: err.message,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (data: PasswordForm) => {
    try {
      setSavingPassword(true);
      await changePassword(data.currentPassword, data.newPassword);
      resetPasswordForm();
      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        text2: "Tu contraseña ha sido modificada con éxito",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo cambiar la contraseña",
        text2: err.message,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setSendingVerification(true);
      await sendVerificationEmail();
      Toast.show({
        type: "success",
        text1: "Correo enviado",
        text2: "Revisa tu bandeja de entrada o carpeta de spam",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message,
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setCheckingVerification(true);
      const verified = await refreshUser();
      if (verified) {
        Toast.show({
          type: "success",
          text1: "Correo verificado",
          text2: "Tu cuenta ya está verificada",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Aún sin verificar",
          text2: "Haz clic en el enlace del correo y vuelve a comprobar",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al comprobar",
        text2: err.message,
      });
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleRetryProfile = async () => {
    try {
      setRetryingProfile(true);
      await retryProfile();
    } finally {
      setRetryingProfile(false);
    }
  };

  const displayName =
    userProfile?.nombre || user?.displayName || "Usuario";
  const displayEmail = userProfile?.email || user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      {/* Cabecera de cuenta */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.emailText}>{displayEmail}</Text>
          <View style={styles.badgesRow}>
            <Tag
              text={isAdmin ? "Administrador" : "Cliente"}
              variant="solid"
            />
            <Tag
              text={isPasswordProvider ? "Correo y contraseña" : "Google"}
            />
          </View>
        </View>
      </View>

      {/* Banner de error de sincronización */}
      {profileError ? (
        <View style={styles.errorBanner}>
          <View style={styles.bannerHeader}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />
            <Text style={styles.errorBannerTitle}>
              Error al sincronizar el perfil
            </Text>
          </View>
          <Text style={styles.bannerDescription}>{profileError}</Text>
          <Button
            title="Reintentar sincronización"
            variant="outline"
            onPress={handleRetryProfile}
            loading={retryingProfile}
            style={styles.bannerBtn}
          />
        </View>
      ) : null}

      {/* Banner de verificación de correo */}
      {isPasswordProvider && !emailVerified ? (
        <View style={styles.verifyBanner}>
          <View style={styles.bannerHeader}>
            <Ionicons
              name="mail-unread-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.verifyBannerTitle}>
              Verifica tu correo electrónico
            </Text>
          </View>
          <Text style={styles.bannerDescription}>
            Te enviamos un enlace de confirmación a {displayEmail}.
          </Text>
          <View style={styles.verifyActions}>
            <Button
              title="Reenviar enlace"
              variant="outline"
              onPress={handleResendVerification}
              loading={sendingVerification}
              disabled={checkingVerification}
              style={styles.verifyBtn}
            />
            <Button
              title="Ya verifiqué"
              onPress={handleCheckVerification}
              loading={checkingVerification}
              disabled={sendingVerification}
              style={styles.verifyBtn}
            />
          </View>
        </View>
      ) : null}

      {/* Formulario de Datos Personales */}
      <View style={styles.card}>
        <SectionLabel text="DATOS PERSONALES" />
        <Controller
          control={profileControl}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Nombre completo"
              placeholder="Juan Pérez"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={profileErrors.nombre?.message}
            />
          )}
        />

        <Controller
          control={profileControl}
          name="telefono"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Teléfono"
              placeholder="+503 7000-0000"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={profileErrors.telefono?.message}
            />
          )}
        />

        <Button
          title="Guardar cambios"
          onPress={handleProfileSubmit(onSaveProfile)}
          loading={savingProfile}
        />
      </View>

      {/* Formulario de cambio de contraseña (solo cuentas email/password) */}
      {isPasswordProvider ? (
        <View style={styles.card}>
          <SectionLabel text="SEGURIDAD Y CONTRASEÑA" />
          <Controller
            control={passwordControl}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Contraseña actual"
                placeholder="••••••••"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={passwordErrors.currentPassword?.message}
              />
            )}
          />

          <Controller
            control={passwordControl}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Nueva contraseña"
                placeholder="••••••••"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={passwordErrors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={passwordControl}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Confirmar nueva contraseña"
                placeholder="••••••••"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={passwordErrors.confirmPassword?.message}
              />
            )}
          />

          <Button
            title="Actualizar contraseña"
            variant="outline"
            onPress={handlePasswordSubmit(onSavePassword)}
            loading={savingPassword}
          />
        </View>
      ) : null}

      {/* Cerrar sesión */}
      <Button
        title="Cerrar sesión"
        variant="danger"
        icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
        onPress={logout}
        style={styles.logoutBtn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 26,
    color: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
  },
  nameText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: colors.primary,
  },
  emailText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  verifyBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  errorBannerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: colors.danger,
  },
  verifyBannerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  bannerDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  bannerBtn: {
    height: 42,
  },
  verifyActions: {
    flexDirection: "row",
    gap: 10,
  },
  verifyBtn: {
    flex: 1,
    height: 42,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  logoutBtn: {
    marginTop: 4,
    marginBottom: 28,
  },
});
