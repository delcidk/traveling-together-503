import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ApiRoute } from "../types/route";
import { getRoutes, getRouteById } from "../services/routeService";

interface RoutesContextType {
  routes: ApiRoute[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<ApiRoute | null>;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

export function RoutesProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRoutes();
      setRoutes(data || []);
    } catch (err: any) {
      console.error("Error loading routes:", err);
      setError(err?.message || "No se pudieron cargar las rutas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getById = useCallback(
    async (id: string): Promise<ApiRoute | null> => {
      const cached = routes.find((r) => r.id === id);
      if (cached) return cached;
      try {
        const remote = await getRouteById(id);
        return remote;
      } catch (err) {
        console.error(`Error fetching route ${id}:`, err);
        return null;
      }
    },
    [routes]
  );

  return (
    <RoutesContext.Provider
      value={{
        routes,
        loading,
        error,
        refresh: fetchAll,
        getById,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes() {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error("useRoutes must be used within a RoutesProvider");
  }
  return context;
}
