import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "./useApi";
import { vehicleService } from "../services/vehicleService";
import { Vehicle } from "@/lib/types";

export function useVehicles(autoFetch = true, initialFilters?: { tipo?: string; estado?: string }) {
  const { getToken } = useAuth();
  
  const getList = useApi(async (filters?: { tipo?: string; estado?: string }) => {
    return vehicleService.getVehicles(filters || initialFilters);
  });

  const getSingle = useApi(async (id: string) => {
    return vehicleService.getVehicle(id);
  });

  const createVehicle = useApi(async (data: Partial<Vehicle>) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const newVehicle = await vehicleService.createVehicle(token, data);
    getList.execute(initialFilters); // refrescar lista
    return newVehicle;
  });

  const updateVehicle = useApi(async (id: string, data: Partial<Vehicle>) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const updated = await vehicleService.updateVehicle(token, id, data);
    getList.execute(initialFilters); // refrescar lista
    return updated;
  });

  const deleteVehicle = useApi(async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    await vehicleService.deleteVehicle(token, id);
    getList.execute(initialFilters); // refrescar lista
  });

  useEffect(() => {
    if (autoFetch) {
      getList.execute(initialFilters);
    }
  }, [autoFetch]);

  return {
    vehicles: getList.data || [],
    loadingVehicles: getList.loading,
    vehiclesError: getList.error,
    fetchVehicles: getList.execute,
    
    vehicle: getSingle.data,
    loadingVehicle: getSingle.loading,
    vehicleError: getSingle.error,
    fetchVehicle: getSingle.execute,

    createVehicle: createVehicle.execute,
    creatingVehicle: createVehicle.loading,
    createVehicleError: createVehicle.error,

    updateVehicle: updateVehicle.execute,
    updatingVehicle: updateVehicle.loading,
    updateVehicleError: updateVehicle.error,

    deleteVehicle: deleteVehicle.execute,
    deletingVehicle: deleteVehicle.loading,
    deleteVehicleError: deleteVehicle.error,
  };
}
