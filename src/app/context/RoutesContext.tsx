"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRoutes } from "../hooks/useRoutes";

type RoutesContextType = ReturnType<typeof useRoutes>;

const RoutesContext = createContext<RoutesContextType | null>(null);

export const RoutesProvider = ({ children }: { children: ReactNode }) => {
  const routesState = useRoutes(true);

  return (
    <RoutesContext.Provider value={routesState}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutesContext = () => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error("useRoutesContext must be used within a RoutesProvider");
  }
  return context;
};
