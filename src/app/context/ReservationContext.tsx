"use client";

import { createContext, useContext, useState, ReactNode } from "react";
// 1. Contexto vacío
const ReservationContext = createContext({});

// 2. Provider
export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  // Estados
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [pasajeros, setPasajeros] = useState(1);
  const [precioTotal, setPrecioTotal] = useState(0);

  // Lógica para calcular el precio


  return (
    <ReservationContext.Provider value={{ origen, setOrigen, destino, setDestino, pasajeros, setPasajeros, precioTotal, setPrecioTotal }}>
      {children}
    </ReservationContext.Provider>
  );
};

// 3. Custom Hook
export const useReservation = () => {
  return useContext(ReservationContext);
};