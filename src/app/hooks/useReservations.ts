import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "./useApi";
import { reservationService } from "../services/reservationService";
import { Reservation } from "@/lib/types";

export function useReservations(autoFetch = false, initialFilters?: { estado?: string; userId?: string }) {
  const { user, getToken } = useAuth();
  
  const getList = useApi(async (filters?: { estado?: string; userId?: string }) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    return reservationService.getReservations(token, filters || initialFilters);
  });

  const getSingle = useApi(async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    return reservationService.getReservation(token, id);
  });

  const createReservation = useApi(async (data: Partial<Reservation>) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const newReservation = await reservationService.createReservation(token, data);
    getList.execute(initialFilters);
    return newReservation;
  });

  const updateReservation = useApi(async (id: string, data: Partial<Reservation>) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const updated = await reservationService.updateReservation(token, id, data);
    getList.execute(initialFilters);
    return updated;
  });

  const deleteReservation = useApi(async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    await reservationService.deleteReservation(token, id);
    getList.execute(initialFilters);
  });

  useEffect(() => {
    if (autoFetch && user) {
      getList.execute(initialFilters);
    }
  }, [autoFetch, user]);

  return {
    reservations: getList.data || [],
    loadingReservations: getList.loading,
    reservationsError: getList.error,
    fetchReservations: getList.execute,
    
    reservation: getSingle.data,
    loadingReservation: getSingle.loading,
    reservationError: getSingle.error,
    fetchReservation: getSingle.execute,

    createReservation: createReservation.execute,
    creatingReservation: createReservation.loading,
    createReservationError: createReservation.error,

    updateReservation: updateReservation.execute,
    updatingReservation: updateReservation.loading,
    updateReservationError: updateReservation.error,

    deleteReservation: deleteReservation.execute,
    deletingReservation: deleteReservation.loading,
    deleteReservationError: deleteReservation.error,
  };
}
