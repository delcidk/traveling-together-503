"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { userService } from "../services/userService";
import { User } from "@/lib/types";

// Este Context es específicamente para que los Administradores gestionen TODOS los usuarios.
// (El perfil propio del usuario se maneja en useUserProfile).

type UsersContextType = {
  users: User[];
  loadingUsers: boolean;
  usersError: string | null;
  fetchUsers: () => void;
  updateUserRole: (uid: string, rol: "cliente" | "admin") => Promise<User | null>;
  updatingUser: boolean;
};

const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const { getToken } = useAuth();

  const getList = useApi(async () => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    return userService.getUsers(token);
  });

  const updateRole = useApi(async (uid: string, rol: "cliente" | "admin") => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const updated = await userService.updateUserProfile(token, uid, { rol });
    getList.execute(); // refrescar lista tras cambiar rol
    return updated;
  });

  useEffect(() => {
    // Autocargar usuarios si somos admin (el backend rechazará si no lo somos)
    getList.execute().catch(() => {});
  }, []);

  return (
    <UsersContext.Provider 
      value={{
        users: getList.data || [],
        loadingUsers: getList.loading,
        usersError: getList.error,
        fetchUsers: getList.execute,
        updateUserRole: updateRole.execute,
        updatingUser: updateRole.loading
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return context;
};
