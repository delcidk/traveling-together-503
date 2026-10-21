import { Reservation, Trip, User } from "@shared/types";

export type ReservationStatus = "pendiente" | "confirmada" | "pagada" | "cancelada";

export type ApiReservation = Omit<Reservation, "createdAt" | "updatedAt" | "viajeFecha"> & {
  createdAt: string;
  updatedAt: string;
};

export type ApiTrip = Omit<Trip, "fechaSalida" | "createdAt" | "updatedAt"> & {
  fechaSalida: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiUser = Omit<User, "createdAt"> & {
  createdAt?: string;
};
