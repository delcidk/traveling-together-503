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

// --- Vehiculos ---
export const VehicleSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  tipo: z.enum(["van", "bus", "microbus"]),
  capacidad: z.number().int().positive(),
  estado: z.enum(["disponible", "en_servicio", "mantenimiento"]),
  imagenUrl: z.string().url().optional(),
  galeria: z.array(z.string().url()).optional(),
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
  galeria: z.array(z.string().url()).optional(),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// --- Rutas ---
export const RouteSchema = z.object({
  id: z.string(),
  origen: z.string().min(1),
  destino: z.string().min(1),
  distanciaKm: z.number().positive(),
  tarifaBase: z.number().nonnegative(),
  descripcion: z.string().optional(),
  imagenUrl: z.string().url().optional(),
  galeria: z.array(z.string().url()).optional(),
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
  galeria: z.array(z.string().url()).optional(),
  activa: z.boolean().default(true),
});

export const UpdateRouteSchema = CreateRouteSchema.partial();

// ----------------------
// VIAJES
// ----------------------
export const TripSchema = z.object({
  rutaId: z.string().min(1, "La ruta es requerida"),
  vehiculoId: z.string().min(1, "El vehículo es requerido"),
  conductor: z.string().optional(),
  fechaSalida: z.date(),
  estado: z.enum(["programado", "en_curso", "finalizado", "cancelado"]).default("programado"),
  asientosOcupados: z.number().default(0),
});

export const CreateTripSchema = TripSchema;
export const UpdateTripSchema = TripSchema.partial();

export type Trip = z.infer<typeof TripSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// ----------------------
// RESERVAS
// ----------------------
export const ReservationSchema = z.object({
  viajeId: z.string().min(1, "El viaje es requerido"),
  userId: z.string().optional(),
  clienteNombre: z.string().min(1, "El nombre del cliente es requerido"),
  clienteTelefono: z.string().optional(),
  pasajeros: z.number().min(1, "Debe haber al menos 1 pasajero"),
  precioTotal: z.number().nonnegative(),
  estado: z.enum(["pendiente", "confirmada", "pagada", "cancelada"]).default("pendiente"),
});

export const CreateReservationSchema = ReservationSchema;
export const UpdateReservationSchema = ReservationSchema.partial();

export type Reservation = z.infer<typeof ReservationSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  viajeFecha?: Date;
  viajeRuta?: string;
};

// --- API Responses ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
