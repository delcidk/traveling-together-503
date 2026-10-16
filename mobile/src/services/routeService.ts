import { fetchApi } from "./api";
import { ApiRoute } from "../types/route";

export async function getRoutes(): Promise<ApiRoute[]> {
  return fetchApi<ApiRoute[]>("/api/routes?activa=true");
}

export async function getRouteById(id: string): Promise<ApiRoute> {
  return fetchApi<ApiRoute>(`/api/routes/${id}`);
}
