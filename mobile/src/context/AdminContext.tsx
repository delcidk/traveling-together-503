import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ApiReservation, ApiTrip, ApiUser, ReservationStatus } from "../types/admin";
import { ApiRoute } from "../types/route";
import { adminService } from "../services/adminService";
import { useAuth } from "./AuthContext";
import { useRoutes } from "./RoutesContext";

interface AdminContextType {
  reservations: ApiReservation[];
  trips: ApiTrip[];
  users: ApiUser[];
  routes: ApiRoute[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  changeStatus: (id: string, estado: ReservationStatus) => Promise<void>;
  saveReservation: (data: Partial<ApiReservation>, id?: string) => Promise<void>;
  removeReservation: (id: string) => Promise<void>;
  saveRoute: (data: Partial<ApiRoute>, id?: string) => Promise<void>;
  removeRoute: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { getToken, isAdmin } = useAuth();
  const { refresh: refreshPublicRoutes } = useRoutes();

  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("No se encontró sesión activa");

      const [resList, tripList, userList, routeList] = await Promise.all([
        adminService.getReservations(token),
        adminService.getTrips(token),
        adminService.getUsers(token).catch(() => [] as ApiUser[]),
        adminService.getAllRoutes(),
      ]);

      setReservations(resList || []);
      setTrips(tripList || []);
      setUsers(userList || []);
      setRoutes(routeList || []);
    } catch (err: any) {
      console.error("Error cargando datos de admin:", err);
      setError(err?.message || "No se pudieron cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  }, [getToken, isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const changeStatus = async (id: string, estado: ReservationStatus) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");
    const updated = await adminService.updateReservation(token, id, { estado });
    setReservations((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
  };

  const saveReservation = async (
    data: Partial<ApiReservation>,
    id?: string
  ) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");

    if (id) {
      const updated = await adminService.updateReservation(token, id, data);
      setReservations((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } else {
      const created = await adminService.createReservation(token, data);
      setReservations((prev) => [created, ...prev]);
      const tripList = await adminService.getTrips(token);
      setTrips(tripList || []);
    }
  };

  const removeReservation = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");
    await adminService.deleteReservation(token, id);
    setReservations((prev) => prev.filter((item) => item.id !== id));
  };

  const saveRoute = async (data: Partial<ApiRoute>, id?: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");

    if (id) {
      const updated = await adminService.updateRoute(token, id, data);
      setRoutes((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } else {
      const created = await adminService.createRoute(token, data);
      setRoutes((prev) => [created, ...prev]);
    }
    await refreshPublicRoutes();
  };

  const removeRoute = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");
    await adminService.deleteRoute(token, id);
    setRoutes((prev) => prev.filter((item) => item.id !== id));
    await refreshPublicRoutes();
  };

  return (
    <AdminContext.Provider
      value={{
        reservations,
        trips,
        users,
        routes,
        loading,
        error,
        refresh: fetchAll,
        changeStatus,
        saveReservation,
        removeReservation,
        saveRoute,
        removeRoute,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin debe usarse dentro de un AdminProvider");
  }
  return context;
}
