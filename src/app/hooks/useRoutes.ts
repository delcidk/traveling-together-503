import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "./useApi";
import { routeService } from "../services/routeService";
import { Route } from "@/lib/types";

export function useRoutes(autoFetch = true, initialFilters?: { activa?: boolean }) {
  const { getToken } = useAuth();
  
  const getList = useApi(async (filters?: { activa?: boolean }) => {
    return routeService.getRoutes(filters || initialFilters);
  });

  const getSingle = useApi(async (id: string) => {
    return routeService.getRoute(id);
  });

  const createRoute = useApi(async (data: Partial<Route>) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const newRoute = await routeService.createRoute(token, data);
    getList.execute(initialFilters);
    return newRoute;
  });

  const updateRoute = useApi(async (id: string, data: Partial<Route>) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const updated = await routeService.updateRoute(token, id, data);
    getList.execute(initialFilters);
    return updated;
  });

  const deleteRoute = useApi(async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    await routeService.deleteRoute(token, id);
    getList.execute(initialFilters);
  });

  useEffect(() => {
    if (autoFetch) {
      getList.execute(initialFilters);
    }
  }, [autoFetch]);

  return {
    routes: getList.data || [],
    loadingRoutes: getList.loading,
    routesError: getList.error,
    fetchRoutes: getList.execute,
    
    route: getSingle.data,
    loadingRoute: getSingle.loading,
    routeError: getSingle.error,
    fetchRoute: getSingle.execute,

    createRoute: createRoute.execute,
    creatingRoute: createRoute.loading,
    createRouteError: createRoute.error,

    updateRoute: updateRoute.execute,
    updatingRoute: updateRoute.loading,
    updateRouteError: updateRoute.error,

    deleteRoute: deleteRoute.execute,
    deletingRoute: deleteRoute.loading,
    deleteRouteError: deleteRoute.error,
  };
}
