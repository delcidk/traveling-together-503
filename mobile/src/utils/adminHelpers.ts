import { ApiReservation, ApiTrip, ReservationStatus } from "../types/admin";
import { ApiRoute } from "../types/route";

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

export function reservationCode(id: string): string {
  return `RES-${id.slice(0, 6).toUpperCase()}`;
}

export function statusLabel(estado: ReservationStatus): string {
  return RESERVATION_STATUS_LABELS[estado] || estado;
}

export function countByStatus(reservations: ApiReservation[]): Record<string, number> {
  const counts: Record<string, number> = {
    todas: reservations.length,
    pendiente: 0,
    confirmada: 0,
    pagada: 0,
    cancelada: 0,
  };

  reservations.forEach((r) => {
    if (counts[r.estado] !== undefined) {
      counts[r.estado]++;
    }
  });

  return counts;
}

export function filterByStatus(
  reservations: ApiReservation[],
  status: string
): ApiReservation[] {
  if (!status || status === "todas") return reservations;
  return reservations.filter((r) => r.estado === status);
}

export function formatTripDate(isoDate?: string): string {
  if (!isoDate) return "Sin fecha";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function resolveReservation(
  reservation: ApiReservation,
  trips: ApiTrip[],
  routes: ApiRoute[]
): { rutaLabel: string; fecha: string; trip?: ApiTrip; route?: ApiRoute } {
  const trip = trips.find((t) => t.id === reservation.viajeId);
  if (!trip) {
    return {
      rutaLabel: "Viaje desconocido",
      fecha: formatTripDate(reservation.createdAt),
    };
  }
  const route = routes.find((r) => r.id === trip.rutaId);
  const rutaLabel = route
    ? `${route.origen} ➔ ${route.destino}`
    : "Ruta desconocida";
  return {
    rutaLabel,
    fecha: formatTripDate(trip.fechaSalida),
    trip,
    route,
  };
}

export function allowedTransitions(current: ReservationStatus): {
  status: ReservationStatus;
  label: string;
}[] {
  const all: { status: ReservationStatus; label: string }[] = [
    { status: "confirmada", label: "Confirmar" },
    { status: "pagada", label: "Pagada" },
    { status: "pendiente", label: "Pendiente" },
    { status: "cancelada", label: "Cancelar" },
  ];
  return all.filter((item) => item.status !== current);
}
