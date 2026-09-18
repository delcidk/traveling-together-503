import { User } from "@/lib/types";
import { fetchApi, authHeaders } from "./api";

export const userService = {
  getUsers: async (token: string): Promise<User[]> => {
    return fetchApi<User[]>("/api/users", {
      headers: authHeaders(token),
    });
  },

  getUserProfile: async (token: string, uid: string): Promise<User> => {
    return fetchApi<User>(`/api/users/${uid}`, {
      headers: authHeaders(token),
    });
  },

  createUserProfile: async (token: string, data: { nombre: string; telefono?: string }): Promise<User> => {
    return fetchApi<User>("/api/users", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateUserProfile: async (
    token: string,
    uid: string,
    data: { nombre?: string; telefono?: string; rol?: "cliente" | "admin" }
  ): Promise<User> => {
    return fetchApi<User>(`/api/users/${uid}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },
};
