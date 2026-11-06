import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { User as UserProfile } from "@shared/types";
import { ApiRoute } from "../types/route";
import {
  ApiReservation,
  ApiTrip,
  ApiUser,
  ApiVehicle,
} from "../types/admin";

export function toIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof (val as { toDate?: () => Date }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === "string") {
    const parsed = new Date(val);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  if (typeof val === "number") {
    return new Date(val).toISOString();
  }
  return new Date().toISOString();
}

export function toOptionalIsoString(val: unknown): string | undefined {
  if (val === null || val === undefined) return undefined;
  return toIsoString(val);
}

export function isPermissionDeniedError(err: unknown): boolean {
  const code = (err as { code?: string })?.code || "";
  const msg = (err as { message?: string })?.message || "";
  return (
    code === "permission-denied" ||
    code === "firestore/permission-denied" ||
    msg.toLowerCase().includes("missing or insufficient permissions")
  );
}

function mapRouteDoc(id: string, data: DocumentData): ApiRoute {
  return {
    id,
    origen: data.origen || "",
    destino: data.destino || "",
    distanciaKm: Number(data.distanciaKm || 0),
    tarifaBase: Number(data.tarifaBase || 0),
    descripcion: data.descripcion || undefined,
    imagenUrl: data.imagenUrl || undefined,
    galeria: Array.isArray(data.galeria) ? data.galeria : undefined,
    activa: Boolean(data.activa),
    categoria: data.categoria || undefined,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapTripDoc(id: string, data: DocumentData): ApiTrip {
  return {
    id,
    rutaId: data.rutaId || "",
    vehiculoId: data.vehiculoId || "",
    conductor: data.conductor || undefined,
    fechaSalida: toIsoString(data.fechaSalida),
    estado: data.estado || "programado",
    asientosOcupados: Number(data.asientosOcupados || 0),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapVehicleDoc(id: string, data: DocumentData): ApiVehicle {
  return {
    id,
    nombre: data.nombre || "",
    tipo: data.tipo || "microbus",
    capacidad: Number(data.capacidad || 0),
    estado: data.estado || "disponible",
    imagenUrl: data.imagenUrl || undefined,
    galeria: Array.isArray(data.galeria) ? data.galeria : undefined,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapReservationDoc(id: string, data: DocumentData): ApiReservation {
  return {
    id,
    viajeId: data.viajeId || "",
    rutaId: data.rutaId || undefined,
    rutaNombre: data.rutaNombre || undefined,
    fechaSalida: toOptionalIsoString(data.fechaSalida),
    vehiculoId: data.vehiculoId || undefined,
    userId: data.userId || undefined,
    clienteNombre: data.clienteNombre || "",
    clienteTelefono: data.clienteTelefono || "",
    pasajeros: Number(data.pasajeros || 1),
    precioTotal: Number(data.precioTotal || 0),
    estado: data.estado || "pendiente",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapUserDoc(id: string, data: DocumentData): ApiUser {
  return {
    uid: data.uid || id,
    email: data.email || "",
    nombre: data.nombre || "",
    telefono: data.telefono || undefined,
    rol: data.rol === "admin" ? "admin" : "cliente",
    createdAt: toOptionalIsoString(data.createdAt),
  };
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ref = doc(db, "users", uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data();
      onData({
        uid: data.uid || snap.id,
        email: data.email || "",
        nombre: data.nombre || "",
        telefono: data.telefono || undefined,
        rol: data.rol === "admin" ? "admin" : "cliente",
        createdAt:
          typeof data.createdAt?.toDate === "function"
            ? data.createdAt.toDate()
            : new Date(toIsoString(data.createdAt)),
      });
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeActiveRoutes(
  onData: (routes: ApiRoute[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "routes"), where("activa", "==", true));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => mapRouteDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(String(b.createdAt || 0)).getTime() -
          new Date(String(a.createdAt || 0)).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeAllRoutes(
  onData: (routes: ApiRoute[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, "routes");
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs.map((d) => mapRouteDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(String(b.createdAt || 0)).getTime() -
          new Date(String(a.createdAt || 0)).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeScheduledTripsByRoute(
  rutaId: string,
  onData: (trips: ApiTrip[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "trips"), where("rutaId", "==", rutaId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapTripDoc(d.id, d.data()))
        .filter((t) => t.estado === "programado");
      items.sort(
        (a, b) =>
          new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeAllTrips(
  onData: (trips: ApiTrip[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, "trips");
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs.map((d) => mapTripDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeVehicles(
  onData: (vehicles: ApiVehicle[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, "vehicles");
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs.map((d) => mapVehicleDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeUserReservations(
  uid: string,
  onData: (reservations: ApiReservation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "reservations"), where("userId", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => mapReservationDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeAllReservations(
  onData: (reservations: ApiReservation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, "reservations");
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs.map((d) => mapReservationDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}

export function subscribeAllUsers(
  onData: (users: ApiUser[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, "users");
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs.map((d) => mapUserDoc(d.id, d.data()));
      items.sort(
        (a, b) =>
          new Date(String(b.createdAt || 0)).getTime() -
          new Date(String(a.createdAt || 0)).getTime()
      );
      onData(items);
    },
    (err) => {
      if (!auth.currentUser && isPermissionDeniedError(err)) return;
      onError?.(err);
    }
  );
}
