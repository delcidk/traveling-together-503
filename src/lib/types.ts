import { z } from "zod";

// --- Users ---
export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  nombre: z.string().min(1),
  rol: z.enum(["cliente", "admin"]),
  telefono: z.string().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  telefono: z.string().optional(),
  rol: z.enum(["cliente", "admin"]).optional(),
});

// --- Vehicles ---
export const VehicleSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  tipo: z.enum(["van", "bus", "microbus"]),
  capacidad: z.number().int().positive(),
  estado: z.enum(["disponible", "en_servicio", "mantenimiento"]),
  imagenUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export const CreateVehicleSchema = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(["van", "bus", "microbus"]),
  capacidad: z.number().int().positive(),
  estado: z.enum(["disponible", "en_servicio", "mantenimiento"]),
  imagenUrl: z.string().url().optional(),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// --- Routes ---
export const RouteSchema = z.object({
  id: z.string(),
  origen: z.string().min(1),
  destino: z.string().min(1),
  distanciaKm: z.number().positive(),
  tarifaBase: z.number().nonnegative(),
  descripcion: z.string().optional(),
  imagenUrl: z.string().url().optional(),
  activa: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Route = z.infer<typeof RouteSchema>;

export const CreateRouteSchema = z.object({
  origen: z.string().min(1),
  destino: z.string().min(1),
  distanciaKm: z.number().positive(),
  tarifaBase: z.number().nonnegative(),
  descripcion: z.string().optional(),
  imagenUrl: z.string().url().optional(),
  activa: z.boolean().default(true),
});

export const UpdateRouteSchema = CreateRouteSchema.partial();

// --- Reservations ---
export const ReservationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vehiculoId: z.string(),
  rutaId: z.string(),
  origen: z.string(),
  destino: z.string(),
  fechaViaje: z.date(),
  pasajeros: z.number().int().positive(),
  precioTotal: z.number().nonnegative(),
  estado: z.enum(["pendiente", "confirmada", "cancelada", "completada"]),
  comprobanteUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Reservation = z.infer<typeof ReservationSchema>;

export const CreateReservationSchema = z.object({
  vehiculoId: z.string(),
  rutaId: z.string(),
  origen: z.string(),
  destino: z.string(),
  fechaViaje: z.coerce.date(),
  pasajeros: z.number().int().positive(),
  precioTotal: z.number().nonnegative(),
});

export const UpdateReservationSchema = z.object({
  estado: z.enum(["pendiente", "confirmada", "cancelada", "completada"]).optional(),
  comprobanteUrl: z.string().url().optional(),
});

// --- API Responses ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
