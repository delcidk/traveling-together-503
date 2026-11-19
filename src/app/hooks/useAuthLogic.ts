import { useState, useEffect, useCallback, useRef } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { User as UserProfile } from "@/lib/types";
import {
  AuthCancelledError,
  isAuthCancelledError,
  mapFirebaseAuthError,
} from "@/lib/auth-errors";

interface PendingProfileData {
  nombre?: string;
  telefono?: string;
}

// Utils para cookies simples en el cliente
const setSessionCookie = () => {
  document.cookie = "session_active=true; path=/; max-age=604800; samesite=lax"; // 7 días
};

const removeSessionCookie = () => {
  document.cookie = "session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export function useAuthLogic() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [claimAdmin, setClaimAdmin] = useState(false);
  const [emailVerifiedState, setEmailVerifiedState] = useState(false);
  const [loading, setLoading] = useState(true);

  const pendingProfileRef = useRef<PendingProfileData | null>(null);
  const inFlightProfileRef = useRef<{
    uid: string;
    promise: Promise<UserProfile | null>;
  } | null>(null);

  const syncTokenClaims = useCallback(async (currentUser: User, force = false) => {
    try {
      const tokenResult = await currentUser.getIdTokenResult(force);
      setClaimAdmin(Boolean(tokenResult?.claims?.admin));
    } catch {
      setClaimAdmin(false);
    }
  }, []);

  // Obtiene el perfil desde Firestore o lo auto-crea de forma idempotente (ej. primer login con Google)
  const ensureProfile = useCallback(
    async (
      currentUser: User,
      override?: PendingProfileData
    ): Promise<UserProfile | null> => {
      if (override) {
        pendingProfileRef.current = {
          ...pendingProfileRef.current,
          ...override,
        };
      }

      if (inFlightProfileRef.current?.uid === currentUser.uid) {
        return inFlightProfileRef.current.promise;
      }

      const promise = (async (): Promise<UserProfile | null> => {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(`/api/users/${currentUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              pendingProfileRef.current = null;
              setUserProfile(json.data);
              return json.data;
            }
          }

          if (res.status !== 404) {
            setUserProfile(null);
            return null;
          }

          // No existe en Firestore -> auto-crear documento en users/{uid}
          const fallbackNombre =
            pendingProfileRef.current?.nombre?.trim() ||
            currentUser.displayName?.trim() ||
            currentUser.email?.split("@")[0] ||
            "Usuario";
          const fallbackTelefono =
            pendingProfileRef.current?.telefono?.trim() || undefined;

          const createRes = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nombre: fallbackNombre,
              ...(fallbackTelefono ? { telefono: fallbackTelefono } : {}),
            }),
          });

          const createJson = await createRes.json();
          if (createRes.ok && createJson.success && createJson.data) {
            pendingProfileRef.current = null;
            setUserProfile(createJson.data);
            return createJson.data;
          }

          setUserProfile(null);
          return null;
        } catch (e) {
          console.error("Error fetching/creating profile:", e);
          setUserProfile(null);
          return null;
        } finally {
          if (inFlightProfileRef.current?.uid === currentUser.uid) {
            inFlightProfileRef.current = null;
          }
        }
      })();

      inFlightProfileRef.current = { uid: currentUser.uid, promise };
      return promise;
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSessionCookie();
        setEmailVerifiedState(Boolean(currentUser.emailVerified));
        await Promise.all([
          syncTokenClaims(currentUser),
          ensureProfile(currentUser),
        ]);
      } else {
        removeSessionCookie();
        setUserProfile(null);
        setClaimAdmin(false);
        setEmailVerifiedState(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ensureProfile, syncTokenClaims]);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(true);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await ensureProfile(cred.user);
    } catch (e: unknown) {
      throw new Error(mapFirebaseAuthError(e, "Correo o contraseña incorrectos"));
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;
      await ensureProfile(googleUser, {
        nombre: googleUser.displayName || undefined,
      });
    } catch (e: unknown) {
      if (isAuthCancelledError(e)) {
        throw new AuthCancelledError();
      }
      throw new Error(
        mapFirebaseAuthError(e, "Error al iniciar sesión con Google")
      );
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e: unknown) {
      throw new Error(
        mapFirebaseAuthError(e, "Error al enviar el correo de recuperación")
      );
    }
  };

  const register = async (
    email: string,
    pass: string,
    nombre: string,
    telefono?: string
  ) => {
    const cleanName = nombre.trim();
    const cleanPhone = telefono?.trim() || undefined;
    pendingProfileRef.current = { nombre: cleanName, telefono: cleanPhone };

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        pass
      );
      const currentUser = userCredential.user;

      await updateProfile(currentUser, { displayName: cleanName }).catch(
        () => {}
      );
      sendEmailVerification(currentUser).catch(() => {});

      const profile = await ensureProfile(currentUser, {
        nombre: cleanName,
        telefono: cleanPhone,
      });

      if (!profile) {
        throw new Error("Error al sincronizar el perfil de usuario");
      }
    } catch (e: unknown) {
      pendingProfileRef.current = null;
      throw new Error(mapFirebaseAuthError(e, "Error al crear la cuenta"));
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    await ensureProfile(auth.currentUser);
  }, [ensureProfile]);

  const updateUserProfile = async (data: {
    nombre: string;
    telefono?: string;
  }) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No hay sesión activa");

    const cleanName = data.nombre.trim();
    const cleanPhone = data.telefono?.trim() || "";
    const token = await currentUser.getIdToken();

    const res = await fetch(`/api/users/${currentUser.uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: cleanName,
        telefono: cleanPhone,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "No se pudo actualizar el perfil");
    }

    await updateProfile(currentUser, { displayName: cleanName }).catch(
      () => {}
    );
    setUserProfile(json.data);
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No hay sesión activa con correo electrónico");
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPass
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPass);
    } catch (e: unknown) {
      throw new Error(
        mapFirebaseAuthError(e, "No se pudo actualizar la contraseña")
      );
    }
  };

  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No hay sesión activa");
    try {
      await sendEmailVerification(currentUser);
    } catch (e: unknown) {
      throw new Error(
        mapFirebaseAuthError(e, "No se pudo enviar el correo de verificación")
      );
    }
  };

  const refreshUser = useCallback(async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    await currentUser.reload();
    const verified = Boolean(auth.currentUser?.emailVerified);
    setEmailVerifiedState(verified);
    await syncTokenClaims(currentUser, true);
    return verified;
  }, [syncTokenClaims]);

  const logout = async () => {
    await signOut(auth);
  };

  const isPasswordProvider = Boolean(
    user?.providerData?.some((p) => p.providerId === "password")
  );
  const isGoogleProvider = Boolean(
    user?.providerData?.some((p) => p.providerId === "google.com")
  );

  const emailVerified = isGoogleProvider || emailVerifiedState;
  const isAdmin = claimAdmin || userProfile?.rol === "admin";

  return {
    user,
    userProfile,
    loading,
    getToken,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    refreshProfile,
    updateUserProfile,
    changePassword,
    sendVerificationEmail,
    refreshUser,
    isAdmin,
    emailVerified,
    isPasswordProvider,
  };
}
