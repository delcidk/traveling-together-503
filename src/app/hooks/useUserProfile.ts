import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "./useApi";
import { userService } from "../services/userService";
import { User } from "@/lib/types";

export function useUserProfile() {
  const { user, getToken } = useAuth();
  
  const getProfile = useApi(async () => {
    if (!user) throw new Error("No autenticado");
    const token = await getToken();
    if (!token) throw new Error("No se pudo obtener el token");
    return userService.getUserProfile(token, user.uid);
  });

  const createProfile = useApi(async (data: { nombre: string; telefono?: string }) => {
    const token = await getToken();
    if (!token) throw new Error("No se pudo obtener el token");
    return userService.createUserProfile(token, data);
  });

  const updateProfile = useApi(async (data: Partial<User>) => {
    if (!user) throw new Error("No autenticado");
    const token = await getToken();
    if (!token) throw new Error("No se pudo obtener el token");
    return userService.updateUserProfile(token, user.uid, data);
  });

  // Intentar cargar el perfil automáticamente cuando hay un usuario de Auth
  useEffect(() => {
    if (user) {
      getProfile.execute();
    }
  }, [user]);

  return {
    profile: getProfile.data,
    loadingProfile: getProfile.loading,
    profileError: getProfile.error,
    refreshProfile: getProfile.execute,
    
    createProfile: createProfile.execute,
    creatingProfile: createProfile.loading,
    createProfileError: createProfile.error,
    
    updateProfile: updateProfile.execute,
    updatingProfile: updateProfile.loading,
    updateProfileError: updateProfile.error,
  };
}
