import { Route } from "@/lib/types";
import { fetchApi, authHeaders } from "./api";

export const routeService = {
  getRoutes: async (filters?: { activa?: boolean }): Promise<Route[]> => {
    let url = "/api/routes";
    if (filters && filters.activa !== undefined) {
      url += `?activa=${filters.activa}`;
    }
    return fetchApi<Route[]>(url);
  },

  getRoute: async (id: string): Promise<Route> => {
    return fetchApi<Route>(`/api/routes/${id}`);
  },

  createRoute: async (token: string, data: Partial<Route>): Promise<Route> => {
    return fetchApi<Route>("/api/routes", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  updateRoute: async (token: string, id: string, data: Partial<Route>): Promise<Route> => {
    return fetchApi<Route>(`/api/routes/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
  },

  deleteRoute: async (token: string, id: string): Promise<void> => {
    return fetchApi<void>(`/api/routes/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },
};
