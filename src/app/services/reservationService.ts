import { Reservation } from "@/lib/types";
import { fetchApi, authHeaders } from "./api";

export const reservationService = {
  getReservations: async (token: string, filters?: { estado?: string; userId?: string }): Promise<Reservation[]> => {
    let url = "/api/reservations";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.userId) params.append("userId", filters.userId);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return fetchApi<Reservation[]>(url, {
      headers: authHeaders(token),
    });
  },

  getReservation: async (token: string, id: string): Promise<Reservation> => {
    return fetchApi<Reservation>(`/api/reservations/${id}`, {
      headers: authHeaders(token),
    });
  },

  createReservation: async (token: string, data: Partial<Reservation>): Promise<Reservation> => {
    return fetchApi<Reservation>("/api/reservations", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateReservation: async (token: string, id: string, data: Partial<Reservation>): Promise<Reservation> => {
    return fetchApi<Reservation>(`/api/reservations/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteReservation: async (token: string, id: string): Promise<void> => {
    return fetchApi<void>(`/api/reservations/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },
};
