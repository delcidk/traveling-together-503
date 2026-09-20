import { useState, useEffect, useCallback } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { User as UserProfile } from "@/lib/types";

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
  const [loading, setLoading] = useState(true);

  // Función interna para traer el perfil
  const fetchProfile = async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/users/${currentUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUserProfile(json.data);
      } else {
        setUserProfile(null);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSessionCookie();
        await fetchProfile(currentUser);
      } else {
        removeSessionCookie();
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
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged se dispara y actualiza el estado
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const register = async (email: string, pass: string, nombre: string, telefono?: string) => {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const currentUser = userCredential.user;
    const token = await currentUser.getIdToken();

    // 2. Crear perfil en Firestore vía la API
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre, telefono }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      // Si la API falla, sería ideal hacer un rollback, pero por ahora lanzamos el error
      throw new Error(json.error || "Error al crear el perfil");
    }

    // onAuthStateChanged se encargará de setear el usuario y hacer fetchProfile.
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged se dispara, setea user a null y borra cookies
  };

  const isAdmin = userProfile?.rol === "admin";

  return {
    user,
    userProfile,
    loading,
    getToken,
    login,
    register,
    logout,
    resetPassword,
    isAdmin,
  };
}
