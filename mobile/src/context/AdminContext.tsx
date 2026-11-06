import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  ApiReservation,
  ApiTrip,
  ApiUser,
  ApiVehicle,
  ReservationStatus,
} from "../types/admin";
import { ApiRoute } from "../types/route";
import { adminService } from "../services/adminService";
import {
  subscribeAllReservations,
  subscribeAllRoutes,
  subscribeAllTrips,
  subscribeAllUsers,
  subscribeVehicles,
} from "../services/firestore";
import { useAuth } from "./AuthContext";
import { useRoutes } from "./RoutesContext";

interface AdminContextType {
  reservations: ApiReservation[];
  trips: ApiTrip[];
  vehicles: ApiVehicle[];
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
  saveTrip: (data: Partial<ApiTrip>, id?: string) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  saveVehicle: (data: Partial<ApiVehicle>, id?: string) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, getToken, isAdmin } = useAuth();
  const { refresh: refreshPublicRoutes } = useRoutes();

  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
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

      const [resList, tripList, vehicleList, userList, routeList] =
        await Promise.all([
          adminService.getReservations(token),
          adminService.getTrips(token),
          adminService.getVehicles(token).catch(() => [] as ApiVehicle[]),
          adminService.getUsers(token).catch(() => [] as ApiUser[]),
          adminService.getAllRoutes(),
        ]);

      setReservations(resList || []);
      setTrips(tripList || []);
      setVehicles(vehicleList || []);
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
    if (!user || !isAdmin) {
      setReservations([]);
      setTrips([]);
      setVehicles([]);
      setUsers([]);
      setRoutes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let initialLoaded = false;
    const markLoaded = () => {
      if (!initialLoaded) {
        initialLoaded = true;
        setLoading(false);
      }
    };

    const unsubs = [
      subscribeAllReservations(
        (items) => {
          setReservations(items);
          markLoaded();
        },
        () => {
          fetchAll();
        }
      ),
      subscribeAllTrips(
        (items) => {
          setTrips(items);
          markLoaded();
        },
        () => {}
      ),
      subscribeVehicles(
        (items) => {
          setVehicles(items);
          markLoaded();
        },
        () => {}
      ),
      subscribeAllUsers(
        (items) => {
          setUsers(items);
        },
        () => {}
      ),
      subscribeAllRoutes(
        (items) => {
          setRoutes(items);
          markLoaded();
        },
        () => {}
      ),
    ];

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user, isAdmin, fetchAll]);

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
      setReservations((prev) => {
        if (prev.some((r) => r.id === created.id)) return prev;
        return [created, ...prev];
      });
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
      setRoutes((prev) => {
        if (prev.some((r) => r.id === created.id)) return prev;
        return [created, ...prev];
      });
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

  const saveTrip = async (data: Partial<ApiTrip>, id?: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");

    if (id) {
      const updated = await adminService.updateTrip(token, id, data);
      setTrips((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } else {
      const created = await adminService.createTrip(token, data);
      setTrips((prev) => {
        if (prev.some((t) => t.id === created.id)) return prev;
        return [...prev, created];
      });
    }
  };

  const removeTrip = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");
    await adminService.deleteTrip(token, id);
    setTrips((prev) => prev.filter((item) => item.id !== id));
  };

  const saveVehicle = async (data: Partial<ApiVehicle>, id?: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");

    if (id) {
      const updated = await adminService.updateVehicle(token, id, data);
      setVehicles((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } else {
      const created = await adminService.createVehicle(token, data);
      setVehicles((prev) => {
        if (prev.some((v) => v.id === created.id)) return prev;
        return [created, ...prev];
      });
    }
  };

  const removeVehicle = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("Sesión expirada");
    await adminService.deleteVehicle(token, id);
    setVehicles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        reservations,
        trips,
        vehicles,
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
        saveTrip,
        removeTrip,
        saveVehicle,
        removeVehicle,
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
