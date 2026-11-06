import { z } from "zod";

export const routeFormSchema = z.object({
  origen: z.string().min(1, "El origen es obligatorio"),
  destino: z.string().min(1, "El destino es obligatorio"),
  tarifaBase: z
    .string()
    .min(1, "La tarifa es obligatoria")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
      message: "Ingresa una tarifa válida mayor o igual a 0",
    }),
  distanciaKm: z
    .string()
    .min(1, "La distancia es obligatoria")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "La distancia debe ser mayor a 0",
    }),
  descripcion: z.string().optional(),
  imagenUrl: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  galeria: z.array(z.string()).optional(),
  categoria: z
    .enum(["playa", "internacional", "aeropuerto", "ciudad", "escenico"])
    .optional()
    .or(z.literal("")),
  activa: z.boolean(),
});

export type RouteFormInput = z.infer<typeof routeFormSchema>;

export const reservationFormSchema = z.object({
  viajeId: z.string().min(1, "Selecciona un viaje programado"),
  userId: z.string().optional(),
  clienteNombre: z.string().min(1, "El nombre del cliente es obligatorio"),
  clienteTelefono: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s()]{7,20}$/.test(val), {
      message: "Teléfono inválido (solo números, +, - o espacios)",
    }),
  pasajeros: z
    .string()
    .min(1, "Indica la cantidad de pasajeros")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 1,
      "Debe haber al menos 1 pasajero"
    ),
  precioTotal: z
    .string()
    .min(1, "El cobro total es obligatorio")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
      message: "Ingresa un monto válido",
    }),
  estado: z.enum(["pendiente", "confirmada", "pagada", "cancelada"]),
});

export type ReservationFormInput = z.infer<typeof reservationFormSchema>;

export const tripFormSchema = z.object({
  rutaId: z.string().min(1, "Selecciona una ruta"),
  vehiculoId: z.string().min(1, "Selecciona un vehículo"),
  conductor: z.string().optional(),
  fechaSalida: z
    .string()
    .min(1, "La fecha de salida es obligatoria")
    .refine((v) => !isNaN(new Date(v).getTime()), {
      message: "Fecha de salida inválida",
    }),
  estado: z.enum(["programado", "en_curso", "finalizado", "cancelado"]),
  asientosOcupados: z
    .string()
    .refine(
      (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0),
      "Ingresa un número entero mayor o igual a 0"
    ),
});

export type TripFormInput = z.infer<typeof tripFormSchema>;

export const vehicleFormSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  tipo: z.enum(["van", "microbus", "bus"]),
  capacidad: z
    .string()
    .min(1, "La capacidad es obligatoria")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, {
      message: "La capacidad debe ser al menos 1 pasajero",
    }),
  estado: z.enum(["disponible", "en_servicio", "mantenimiento"]),
  imagenUrl: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  galeria: z.array(z.string()).optional(),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;
