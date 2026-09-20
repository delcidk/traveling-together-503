"use client";

import { createContext, useContext, ReactNode } from "react";
import { useReservations } from "../hooks/useReservations";

type UseReservationsType = ReturnType<typeof useReservations>;

interface ReservationContextType extends UseReservationsType {}

const ReservationContext = createContext<ReservationContextType | null>(null);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const reservationsState = useReservations(true);

  return (
    <ReservationContext.Provider value={{ ...reservationsState }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservationContext = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservationContext must be used within a ReservationProvider");
  }
  return context;
};