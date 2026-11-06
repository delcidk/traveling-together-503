import { fetchApi, authHeaders } from "./api";
import { ApiReservation, ApiTrip, ApiUser, ApiVehicle } from "../types/admin";
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

  // --- Viajes (CRUD completo) ---
  getTrips: async (token: string): Promise<ApiTrip[]> => {
    return fetchApi<ApiTrip[]>("/api/trips", {
      headers: authHeaders(token),
    });
  },

  createTrip: async (
    token: string,
    data: Partial<ApiTrip>
  ): Promise<ApiTrip> => {
    return fetchApi<ApiTrip>("/api/trips", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateTrip: async (
    token: string,
    id: string,
    data: Partial<ApiTrip>
  ): Promise<ApiTrip> => {
    return fetchApi<ApiTrip>(`/api/trips/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteTrip: async (token: string, id: string): Promise<void> => {
    await fetchApi(`/api/trips/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },

  // --- Vehículos (CRUD completo) ---
  getVehicles: async (token: string): Promise<ApiVehicle[]> => {
    return fetchApi<ApiVehicle[]>("/api/vehicles", {
      headers: authHeaders(token),
    });
  },

  createVehicle: async (
    token: string,
    data: Partial<ApiVehicle>
  ): Promise<ApiVehicle> => {
    return fetchApi<ApiVehicle>("/api/vehicles", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateVehicle: async (
    token: string,
    id: string,
    data: Partial<ApiVehicle>
  ): Promise<ApiVehicle> => {
    return fetchApi<ApiVehicle>(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteVehicle: async (token: string, id: string): Promise<void> => {
    await fetchApi(`/api/vehicles/${id}`, {
      method: "DELETE",
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
