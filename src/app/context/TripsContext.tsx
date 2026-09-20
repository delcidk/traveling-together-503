"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Trip } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface TripsContextType {
  trips: Trip[];
  loadingTrips: boolean;
  refreshTrips: () => Promise<void>;
  createTrip: (data: any) => Promise<void>;
  updateTrip: (id: string, data: any) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
}

const TripsContext = createContext<TripsContextType>({
  trips: [],
  loadingTrips: true,
  refreshTrips: async () => {},
  createTrip: async () => {},
  updateTrip: async () => {},
  deleteTrip: async () => {},
});

export const useTripsContext = () => useContext(TripsContext);

export const TripsProvider = ({ children }: { children: React.ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const { getToken } = useAuth();

  const fetchTrips = async () => {
    try {
      setLoadingTrips(true);
      const token = await getToken();
      if (!token) return;
      
      const res = await fetch("/api/trips", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setTrips(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch trips", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = async (data: any) => {
    const token = await getToken();
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    await fetchTrips();
  };

  const updateTrip = async (id: string, data: any) => {
    const token = await getToken();
    const res = await fetch(`/api/trips/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    await fetchTrips();
  };

  const deleteTrip = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`/api/trips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    await fetchTrips();
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        loadingTrips,
        refreshTrips: fetchTrips,
        createTrip,
        updateTrip,
        deleteTrip,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};
