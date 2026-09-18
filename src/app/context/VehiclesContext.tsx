"use client";

import { createContext, useContext, ReactNode } from "react";
import { useVehicles } from "../hooks/useVehicles";

// Se infiere el tipo a partir de lo que devuelve el hook
type VehiclesContextType = ReturnType<typeof useVehicles>;

const VehiclesContext = createContext<VehiclesContextType | null>(null);

export const VehiclesProvider = ({ children }: { children: ReactNode }) => {
  // Instanciamos el hook aquí una sola vez. autoFetch en true.
  const vehiclesState = useVehicles(true);

  return (
    <VehiclesContext.Provider value={vehiclesState}>
      {children}
    </VehiclesContext.Provider>
  );
};

export const useVehiclesContext = () => {
  const context = useContext(VehiclesContext);
  if (!context) {
    throw new Error("useVehiclesContext must be used within a VehiclesProvider");
  }
  return context;
};
