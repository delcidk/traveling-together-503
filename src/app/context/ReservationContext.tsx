"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useReservations } from "../hooks/useReservations";
import { Reservation } from "@/lib/types";

export interface QuotationDraft {
  rutaId: string;
  vehiculoId: string;
  origen: string;
  destino: string;
  pasajeros: number;
  precioTotal: number;
  fechaViaje: Date | null;
}

const defaultDraft: QuotationDraft = {
  rutaId: "",
  vehiculoId: "",
  origen: "",
  destino: "",
  pasajeros: 1,
  precioTotal: 0,
  fechaViaje: null,
};

type UseReservationsType = ReturnType<typeof useReservations>;

interface ReservationContextType extends UseReservationsType {
  draft: QuotationDraft;
  setDraft: (data: Partial<QuotationDraft>) => void;
  resetDraft: () => void;
  submitReservation: () => Promise<Reservation | null>;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  // 1. Estado en memoria (Borrador del cotizador)
  const [draft, setDraftState] = useState<QuotationDraft>(defaultDraft);

  const setDraft = (data: Partial<QuotationDraft>) => {
    setDraftState((prev) => ({ ...prev, ...data }));
  };

  const resetDraft = () => {
    setDraftState(defaultDraft);
  };

  // 2. Estado persistido (API) con autoFetch true para ver la lista de reservas
  const reservationsState = useReservations(true);

  // 3. Acción helper para crear usando el draft actual
  const submitReservation = async () => {
    if (!draft.rutaId || !draft.vehiculoId || !draft.fechaViaje) {
      throw new Error("Faltan datos obligatorios en la cotización");
    }
    
    const result = await reservationsState.createReservation({
      rutaId: draft.rutaId,
      vehiculoId: draft.vehiculoId,
      origen: draft.origen,
      destino: draft.destino,
      pasajeros: draft.pasajeros,
      precioTotal: draft.precioTotal,
      fechaViaje: draft.fechaViaje,
    });
    
    if (result) {
      resetDraft(); // Limpiar tras el éxito
    }
    return result;
  };

  return (
    <ReservationContext.Provider 
      value={{ 
        ...reservationsState,
        draft, 
        setDraft, 
        resetDraft,
        submitReservation
      }}
    >
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