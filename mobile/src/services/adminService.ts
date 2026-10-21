import { fetchApi, authHeaders } from "./api";
import { ApiReservation, ApiTrip, ApiUser } from "../types/admin";
import { ApiRoute } from "../types/route";

export const adminService = {
  // --- Reservaciones ---
  getReservations: async (token: string): Promise<ApiReservation[]> => {
    return fetchApi<ApiReservation[]>("/api/reservations", {
      headers: authHeaders(token),
    });
  },

  createReservation: async (
    token: string,
    data: Partial<ApiReservation>
  ): Promise<ApiReservation> => {
    return fetchApi<ApiReservation>("/api/reservations", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateReservation: async (
    token: string,
    id: string,
    data: Partial<ApiReservation>
  ): Promise<ApiReservation> => {
    return fetchApi<ApiReservation>(`/api/reservations/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteReservation: async (token: string, id: string): Promise<void> => {
    await fetchApi(`/api/reservations/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },

  // --- Viajes (lectura para selector de reserva) ---
  getTrips: async (token: string): Promise<ApiTrip[]> => {
    return fetchApi<ApiTrip[]>("/api/trips", {
      headers: authHeaders(token),
    });
  },

  // --- Usuarios (lectura para asociar reserva) ---
  getUsers: async (token: string): Promise<ApiUser[]> => {
    return fetchApi<ApiUser[]>("/api/users", {
      headers: authHeaders(token),
    });
  },

  // --- Rutas (CRUD completo, incluyendo inactivas) ---
  getAllRoutes: async (): Promise<ApiRoute[]> => {
    return fetchApi<ApiRoute[]>("/api/routes");
  },

  createRoute: async (
    token: string,
    data: Partial<ApiRoute>
  ): Promise<ApiRoute> => {
    return fetchApi<ApiRoute>("/api/routes", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateRoute: async (
    token: string,
    id: string,
    data: Partial<ApiRoute>
  ): Promise<ApiRoute> => {
    return fetchApi<ApiRoute>(`/api/routes/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteRoute: async (token: string, id: string): Promise<void> => {
    await fetchApi(`/api/routes/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },
};
