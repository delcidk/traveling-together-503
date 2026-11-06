import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Platform, TurboModuleRegistry } from "react-native";
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
  signInWithCredential,
} from "firebase/auth";
import type * as GoogleSigninPkg from "@react-native-google-signin/google-signin";
import { auth } from "../config/firebase";
import { User as UserProfile } from "@shared/types";
import { fetchApi, authHeaders, ApiError } from "../services/api";
import { subscribeUserProfile } from "../services/firestore";
import {
  AuthCancelledError,
  isAuthCancelledError,
  mapFirebaseAuthError,
} from "../utils/authErrors";

interface PendingProfileData {
  nombre?: string;
  telefono?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  getToken: (forceRefresh?: boolean) => Promise<string | null>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string,
    pass: string,
    nombre: string,
    telefono?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  retryProfile: () => Promise<void>;
  updateUserProfile: (data: {
    nombre: string;
    telefono?: string;
  }) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  isAdmin: boolean;
  emailVerified: boolean;
  isPasswordProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let googleConfigured = false;

function getGoogleSigninModule(): typeof GoogleSigninPkg | null {
  if (Platform.OS === "web") return null;
  const nativeMod = TurboModuleRegistry.get("RNGoogleSignin");
  if (!nativeMod) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require("@react-native-google-signin/google-signin") as typeof GoogleSigninPkg;
  if (!googleConfigured) {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim().replace(
      /^"|"$/g,
      ""
    );
    pkg.GoogleSignin.configure({
      webClientId,
      offlineAccess: true,
    });
    googleConfigured = true;
  }
  return pkg;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [claimAdmin, setClaimAdmin] = useState(false);
  const [emailVerifiedState, setEmailVerifiedState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const pendingProfileRef = useRef<PendingProfileData | null>(null);
  const inFlightProfileRef = useRef<{
    uid: string;
    promise: Promise<UserProfile | null>;
  } | null>(null);

  const syncTokenClaims = useCallback(async (currentUser: User, force = false) => {
    try {
      const tokenResult = await currentUser.getIdTokenResult(force);
      setClaimAdmin(Boolean(tokenResult.claims?.admin));
    } catch {
      setClaimAdmin(false);
    }
  }, []);

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
          setProfileError(null);
          const token = await currentUser.getIdToken();

          try {
            const existing = await fetchApi<UserProfile>(
              `/api/users/${currentUser.uid}`,
              { headers: authHeaders(token) }
            );
            pendingProfileRef.current = null;
            setUserProfile(existing);
            return existing;
          } catch (getErr: any) {
            const isNotFound =
              (getErr instanceof ApiError && getErr.status === 404) ||
              String(getErr?.message || "")
                .toLowerCase()
                .includes("not found");

            if (!isNotFound) {
              // Reintentar una vez ante fallo transitorio de red
              await delay(700);
              const retried = await fetchApi<UserProfile>(
                `/api/users/${currentUser.uid}`,
                { headers: authHeaders(token) }
              );
              pendingProfileRef.current = null;
              setUserProfile(retried);
              return retried;
            }
          }

          // No existe en Firestore -> autocrear perfil
          const fallbackNombre =
            pendingProfileRef.current?.nombre?.trim() ||
            currentUser.displayName?.trim() ||
            currentUser.email?.split("@")[0] ||
            "Usuario";
          const fallbackTelefono =
            pendingProfileRef.current?.telefono?.trim() || undefined;

          try {
            const created = await fetchApi<UserProfile>("/api/users", {
              method: "POST",
              headers: authHeaders(token),
              body: JSON.stringify({
                nombre: fallbackNombre,
                ...(fallbackTelefono ? { telefono: fallbackTelefono } : {}),
              }),
            });
            pendingProfileRef.current = null;
            setUserProfile(created);
            return created;
          } catch (postErr: any) {
            const msg = String(postErr?.message || "");
            if (msg.includes("ya existe")) {
              const existing = await fetchApi<UserProfile>(
                `/api/users/${currentUser.uid}`,
                { headers: authHeaders(token) }
              );
              pendingProfileRef.current = null;
              setUserProfile(existing);
              return existing;
            }
            // Un reintento si fue error de red al crear
            await delay(700);
            const createdRetry = await fetchApi<UserProfile>("/api/users", {
              method: "POST",
              headers: authHeaders(token),
              body: JSON.stringify({
                nombre: fallbackNombre,
                ...(fallbackTelefono ? { telefono: fallbackTelefono } : {}),
              }),
            });
            pendingProfileRef.current = null;
            setUserProfile(createdRetry);
            return createdRetry;
          }
        } catch (err: any) {
          console.error("Error sincronizando perfil:", err);
          setProfileError(
            err?.message || "No se pudo sincronizar tu perfil de usuario"
          );
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
        setEmailVerifiedState(Boolean(currentUser.emailVerified));
        await Promise.all([
          syncTokenClaims(currentUser),
          ensureProfile(currentUser),
        ]);
      } else {
        setUserProfile(null);
        setClaimAdmin(false);
        setEmailVerifiedState(false);
        setProfileError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ensureProfile, syncTokenClaims]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribeProfile = subscribeUserProfile(
      user.uid,
      (liveProfile) => {
        if (liveProfile) {
          setUserProfile(liveProfile);
          setProfileError(null);
        }
      },
      () => {
        // Si las reglas aún no están desplegadas, ensureProfile (REST) mantiene el perfil
      }
    );
    return () => unsubscribeProfile();
  }, [user?.uid]);

  const getToken = useCallback(async (forceRefresh = false) => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(forceRefresh);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await ensureProfile(cred.user);
    } catch (e: unknown) {
      throw new Error(mapFirebaseAuthError(e, "Error al iniciar sesión"));
    }
  };

  const loginWithGoogle = async () => {
    const googlePkg = getGoogleSigninModule();
    if (!googlePkg) {
      throw new Error(
        "Google Sign-In requiere el APK de desarrollo (Development Build), no funciona en Expo Go."
      );
    }

    try {
      await googlePkg.GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await googlePkg.GoogleSignin.signIn();
      if (googlePkg.isCancelledResponse(response)) {
        throw new AuthCancelledError();
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error(
          "No se pudo obtener el token de Google. Verifica el Web Client ID."
        );
      }

      const googleName = response.data?.user?.name || undefined;
      pendingProfileRef.current = { nombre: googleName };

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      await ensureProfile(userCredential.user, {
        nombre: googleName || userCredential.user.displayName || undefined,
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

  const registerUser = async (
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
        throw new Error(
          "Tu cuenta fue creada, pero hubo un problema al sincronizar tu perfil. Puedes reintentar desde Mi Perfil."
        );
      }
    } catch (e: unknown) {
      pendingProfileRef.current = null;
      throw new Error(mapFirebaseAuthError(e, "Error al crear la cuenta"));
    }
  };

  const retryProfile = useCallback(async () => {
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

    const updated = await fetchApi<UserProfile>(
      `/api/users/${currentUser.uid}`,
      {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({
          nombre: cleanName,
          telefono: cleanPhone,
        }),
      }
    );

    await updateProfile(currentUser, { displayName: cleanName }).catch(
      () => {}
    );
    setUserProfile(updated);
    setProfileError(null);
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
        mapFirebaseAuthError(
          e,
          "No se pudo enviar el correo de verificación"
        )
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

  const logoutUser = async () => {
    const googlePkg = getGoogleSigninModule();
    if (googlePkg) {
      try {
        await googlePkg.GoogleSignin.signOut();
      } catch {
        // Ignorar si no había sesión de Google activa
      }
    }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        profileError,
        getToken,
        login,
        loginWithGoogle,
        register: registerUser,
        logout: logoutUser,
        resetPassword,
        retryProfile,
        updateUserProfile,
        changePassword,
        sendVerificationEmail,
        refreshUser,
        isAdmin,
        emailVerified,
        isPasswordProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
