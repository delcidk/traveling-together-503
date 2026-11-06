export const AUTH_CANCELLED_CODE = "auth/cancelled-by-user";

export class AuthCancelledError extends Error {
  code = AUTH_CANCELLED_CODE;
  constructor() {
    super("Inicio de sesión cancelado");
    this.name = "AuthCancelledError";
  }
}

export function isAuthCancelledError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return (
    code === AUTH_CANCELLED_CODE ||
    code === "SIGN_IN_CANCELLED" ||
    code === "12501" ||
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  );
}

export function mapFirebaseAuthError(
  error: unknown,
  fallbackMessage = "Ocurrió un error de autenticación"
): string {
  if (!error || typeof error !== "object") return fallbackMessage;

  const err = error as { code?: string; message?: string };
  const code = err.code || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada por un administrador";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta registrada con este correo";
    case "auth/weak-password":
      return "La contraseña es muy débil (mínimo 6 caracteres)";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Intenta de nuevo más tarde";
    case "auth/network-request-failed":
      return "Error de red. Verifica tu conexión a internet";
    case "auth/account-exists-with-different-credential":
      return "Ya existe una cuenta con este correo vinculada a otro método de acceso";
    case "auth/requires-recent-login":
      return "Por seguridad, cierra sesión y vuelve a ingresar antes de hacer este cambio";
    case "auth/operation-not-allowed":
      return "Este método de inicio de sesión no está habilitado en Firebase";
    case "IN_PROGRESS":
      return "Ya hay un inicio de sesión con Google en curso";
    case "PLAY_SERVICES_NOT_AVAILABLE":
      return "Google Play Services no está disponible o actualizado en este dispositivo";
    case "10":
    case "12500":
    case "DEVELOPER_ERROR":
      return "Error de configuración de Google Sign-In (SHA-1 / package en Firebase)";
    default:
      if (err.message && !err.message.startsWith("Firebase:")) {
        return err.message;
      }
      return fallbackMessage;
  }
}
