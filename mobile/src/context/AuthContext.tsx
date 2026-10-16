import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { User as UserProfile } from "@shared/types";
import { fetchApi, authHeaders } from "../services/api";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, nombre: string, telefono?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const data = await fetchApi<UserProfile>(`/api/users/${currentUser.uid}`, {
        headers: authHeaders(token)
      });
      setUserProfile(data || null);
    } catch (e) {
      console.error("Error fetching profile:", e);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(true);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential') throw new Error("Credenciales inválidas");
      if (e.code === 'auth/too-many-requests') throw new Error("Demasiados intentos, intenta más tarde");
      if (e.code === 'auth/network-request-failed') throw new Error("Error de red");
      throw new Error(e.message || "Error al iniciar sesión");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') throw new Error("No hay usuario registrado con este correo");
      throw new Error("Error al enviar el correo de recuperación");
    }
  };

  const registerUser = async (email: string, pass: string, nombre: string, telefono?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const currentUser = userCredential.user;
      const token = await currentUser.getIdToken();

      await fetchApi("/api/users", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ nombre, telefono }),
      });
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') throw new Error("El correo ya está en uso");
      if (e.code === 'auth/weak-password') throw new Error("La contraseña es muy débil");
      throw new Error(e.message || "Error al crear la cuenta");
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const isAdmin = userProfile?.rol === "admin";

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      getToken,
      login,
      register: registerUser,
      logout: logoutUser,
      resetPassword,
      isAdmin,
    }}>
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
