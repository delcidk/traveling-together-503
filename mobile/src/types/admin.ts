import { Reservation, Trip, User, Vehicle } from "@shared/types";

export type ReservationStatus = "pendiente" | "confirmada" | "pagada" | "cancelada";
export type TripStatus = "programado" | "en_curso" | "finalizado" | "cancelado";
export type VehicleType = "van" | "bus" | "microbus";
export type VehicleStatus = "disponible" | "en_servicio" | "mantenimiento";

export type ApiReservation = Omit<Reservation, "createdAt" | "updatedAt" | "viajeFecha" | "fechaSalida"> & {
  fechaSalida?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiTrip = Omit<Trip, "fechaSalida" | "createdAt" | "updatedAt"> & {
  fechaSalida: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiVehicle = Omit<Vehicle, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type ApiUser = Omit<User, "createdAt"> & {
  createdAt?: string;
};
