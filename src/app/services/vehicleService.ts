import { Vehicle } from "@/lib/types";
import { fetchApi, authHeaders } from "./api";

export const vehicleService = {
  getVehicles: async (filters?: { tipo?: string; estado?: string }): Promise<Vehicle[]> => {
    let url = "/api/vehicles";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.tipo) params.append("tipo", filters.tipo);
      if (filters.estado) params.append("estado", filters.estado);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return fetchApi<Vehicle[]>(url);
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    return fetchApi<Vehicle>(`/api/vehicles/${id}`);
  },

  createVehicle: async (token: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    return fetchApi<Vehicle>("/api/vehicles", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateVehicle: async (token: string, id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    return fetchApi<Vehicle>(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteVehicle: async (token: string, id: string): Promise<void> => {
    return fetchApi<void>(`/api/vehicles/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },
};
