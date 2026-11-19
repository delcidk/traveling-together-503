"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import ProtectedRoute from "../components/ProtectedRoute";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/AuthContext";

const ProfileSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d+\s\-]{8,15}$/.test(val), {
      message: "Teléfono inválido (8 a 15 dígitos)",
    }),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof PasswordSchema>;

export default function PerfilPage() {
  const {
    user,
    userProfile,
    isAdmin,
    emailVerified,
    isPasswordProvider,
    updateUserProfile,
    changePassword,
    sendVerificationEmail,
    refreshUser,
    logout,
  } = useAuth();
  const router = useRouter();

  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileFormValues>({
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
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSaveProfile = async (data: ProfileFormValues) => {
    try {
      await updateUserProfile({
        nombre: data.nombre,
        telefono: data.telefono,
      });
      toast.success("Perfil actualizado correctamente");
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar el perfil");
    }
  };

  const onSavePassword = async (data: PasswordFormValues) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      resetPasswordForm();
      toast.success("Contraseña actualizada con éxito");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cambiar la contraseña");
    }
  };

  const handleResendVerification = async () => {
    try {
      setSendingVerification(true);
      await sendVerificationEmail();
      toast.success("Correo de verificación enviado. Revisa tu bandeja de entrada.");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo enviar el correo");
    } finally {
      setSendingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setCheckingVerification(true);
      const verified = await refreshUser();
      if (verified) {
        toast.success("¡Tu correo ya está verificado!");
      } else {
        toast("Aún figura sin verificar. Haz clic en el enlace del correo primero.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al comprobar verificación");
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const displayName = userProfile?.nombre || user?.displayName || "Usuario";
  const displayEmail = userProfile?.email || user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  const inputClass = (hasError?: boolean) =>
    `mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white ${
      hasError ? "border-red-300 bg-red-50" : "border-gray-300"
    }`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Topbar */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
              TRAVELING TOGETHER <span className="text-gray-500">503</span>
            </Link>
            <div className="flex items-center gap-4">
              {isAdmin ? (
                <Link href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Panel Admin
                </Link>
              ) : (
                <Link href="/mis-reservas" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Mis Reservas
                </Link>
              )}
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Catálogo
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Cabecera del perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gray-900 text-white font-extrabold text-2xl flex items-center justify-center">
                {initial}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-sm text-gray-500">{displayEmail}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-gray-900 text-white">
                    {isAdmin ? "Administrador" : "Cliente"}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-gray-50">
                    {isPasswordProvider ? "Correo y contraseña" : "Google"}
                  </span>
                  {emailVerified && (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                      Correo verificado
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Banner de verificación de correo */}
          {isPasswordProvider && !emailVerified && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  Verifica tu correo electrónico
                </h2>
                <p className="text-xs text-amber-800 mt-1">
                  Enviamos un enlace de confirmación a <strong>{displayEmail}</strong>.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={sendingVerification || checkingVerification}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  {sendingVerification ? "Enviando..." : "Reenviar enlace"}
                </button>
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={sendingVerification || checkingVerification}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-900 text-white hover:bg-amber-800 disabled:opacity-60"
                >
                  {checkingVerification ? "Comprobando..." : "Ya verifiqué"}
                </button>
              </div>
            </div>
          )}

          {/* Formulario de Datos Personales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-4">
              Datos Personales
            </h2>
            <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4">
              <FormField label="Nombre completo" error={profileErrors.nombre?.message}>
                <input
                  type="text"
                  {...registerProfile("nombre")}
                  className={inputClass(Boolean(profileErrors.nombre))}
                  placeholder="Juan Pérez"
                />
              </FormField>

              <FormField label="Teléfono / WhatsApp" error={profileErrors.telefono?.message}>
                <input
                  type="tel"
                  {...registerProfile("telefono")}
                  className={inputClass(Boolean(profileErrors.telefono))}
                  placeholder="+503 7000-0000"
                />
              </FormField>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>

          {/* Formulario de Cambio de Contraseña (solo cuentas con contraseña) */}
          {isPasswordProvider && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-4">
                Seguridad y Contraseña
              </h2>
              <form onSubmit={handlePasswordSubmit(onSavePassword)} className="space-y-4">
                <FormField
                  label="Contraseña actual"
                  error={passwordErrors.currentPassword?.message}
                >
                  <input
                    type="password"
                    {...registerPassword("currentPassword")}
                    className={inputClass(Boolean(passwordErrors.currentPassword))}
                    placeholder="••••••••"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Nueva contraseña"
                    error={passwordErrors.newPassword?.message}
                  >
                    <input
                      type="password"
                      {...registerPassword("newPassword")}
                      className={inputClass(Boolean(passwordErrors.newPassword))}
                      placeholder="••••••••"
                    />
                  </FormField>

                  <FormField
                    label="Confirmar nueva contraseña"
                    error={passwordErrors.confirmPassword?.message}
                  >
                    <input
                      type="password"
                      {...registerPassword("confirmPassword")}
                      className={inputClass(Boolean(passwordErrors.confirmPassword))}
                      placeholder="••••••••"
                    />
                  </FormField>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  >
                    {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
