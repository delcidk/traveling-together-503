import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { CreateReservationSchema, Reservation } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    
    let isAdmin = false;
    try {
      isAdmin = await verifyAdmin(decodedToken.uid, decodedToken.admin);
    } catch {
      // No es admin
    }

    let query: FirebaseFirestore.Query = adminDb.collection("reservations");

    if (!isAdmin) {
      // Clientes solo pueden ver sus propias reservas
      query = query.where("userId", "==", decodedToken.uid);
    } else {
      // Admins pueden filtrar por userId si lo pasan en el query param
      const userIdParam = searchParams.get("userId");
      if (userIdParam) {
        query = query.where("userId", "==", userIdParam);
      }
    }

    if (estado) {
      query = query.where("estado", "==", estado);
    }

    // Para evitar requerir índices compuestos en Firestore, ordenamos los resultados en memoria
    const snapshot = await query.get();
    let reservations: Reservation[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fechaSalida = data.fechaSalida?.toDate
        ? data.fechaSalida.toDate()
        : data.fechaSalida
        ? new Date(data.fechaSalida)
        : undefined;
      reservations.push({
        id: doc.id,
        viajeId: data.viajeId,
        userId: data.userId || undefined,
        rutaId: data.rutaId || undefined,
        rutaNombre: data.rutaNombre || undefined,
        fechaSalida,
        vehiculoId: data.vehiculoId || undefined,
        clienteNombre: data.clienteNombre,
        clienteTelefono: data.clienteTelefono,
        pasajeros: data.pasajeros,
        precioTotal: data.precioTotal,
        estado: data.estado,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        viajeFecha: fechaSalida,
        viajeRuta: data.rutaNombre || undefined,
      });
    });

    // Ordenar por fecha de creación descendente
    reservations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return jsonResponse(reservations);
  } catch (error: any) {
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid, decodedToken.admin);

    const body = await parseBody(request);
    const parsedData = CreateReservationSchema.parse(body);

    const newResRef = adminDb.collection("reservations").doc();
    const now = new Date();

    const createdReservation = await adminDb.runTransaction(async (tx) => {
      const tripRef = adminDb.collection("trips").doc(parsedData.viajeId);
      const tripDoc = await tx.get(tripRef);
      if (!tripDoc.exists) {
        throw new Error("NOT_FOUND:El viaje especificado no existe");
      }

      const tripData = tripDoc.data()!;
      const routeRef = adminDb.collection("routes").doc(tripData.rutaId);
      const vehicleRef = adminDb.collection("vehicles").doc(tripData.vehiculoId);
      const [routeDoc, vehicleDoc] = await Promise.all([
        tx.get(routeRef),
        tx.get(vehicleRef),
      ]);

      const capacidad = vehicleDoc.exists
        ? Number(vehicleDoc.data()!.capacidad || 8)
        : 8;
      const ocupados = Number(tripData.asientosOcupados || 0);

      const effectiveEstado = parsedData.estado || "pendiente";

      if (
        effectiveEstado !== "cancelada" &&
        ocupados + parsedData.pasajeros > capacidad
      ) {
        const libres = Math.max(0, capacidad - ocupados);
        throw new Error(
          `BAD_REQUEST:No hay suficientes asientos disponibles (disponibles: ${libres})`
        );
      }

      const tarifaBase = routeDoc.exists
        ? Number(routeDoc.data()!.tarifaBase || 0)
        : 0;
      const calculatedPrice = Number(
        (tarifaBase * parsedData.pasajeros).toFixed(2)
      );

      const effectivePrecioTotal =
        parsedData.precioTotal !== undefined
          ? parsedData.precioTotal
          : calculatedPrice;

      const effectiveUserId = parsedData.userId?.trim() || null;

      const rutaNombre = routeDoc.exists
        ? `${routeDoc.data()!.origen} ➔ ${routeDoc.data()!.destino}`
        : undefined;
      const fechaSalida = tripData.fechaSalida?.toDate
        ? tripData.fechaSalida.toDate()
        : new Date(tripData.fechaSalida);

      const firestoreDocData: Record<string, any> = {
        viajeId: parsedData.viajeId,
        userId: effectiveUserId,
        rutaId: tripData.rutaId,
        rutaNombre: rutaNombre || null,
        fechaSalida,
        vehiculoId: tripData.vehiculoId,
        clienteNombre: parsedData.clienteNombre.trim(),
        clienteTelefono: parsedData.clienteTelefono?.trim() || null,
        pasajeros: parsedData.pasajeros,
        precioTotal: effectivePrecioTotal,
        estado: effectiveEstado,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      tx.set(newResRef, firestoreDocData);

      if (effectiveEstado !== "cancelada") {
        tx.update(tripRef, {
          asientosOcupados: ocupados + parsedData.pasajeros,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return {
        id: newResRef.id,
        ...firestoreDocData,
        createdAt: now,
        updatedAt: now,
      };
    });

    return jsonResponse(createdReservation, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(error.errors, 400);
    }
    const msg = String(error.message || "");
    if (msg.startsWith("NOT_FOUND:")) {
      return errorResponse(msg.replace("NOT_FOUND:", ""), 404);
    }
    if (msg.startsWith("BAD_REQUEST:")) {
      return errorResponse(msg.replace("BAD_REQUEST:", ""), 400);
    }
    if (msg.includes("token") || msg.includes("Authorization")) {
      return errorResponse(msg, 401);
    }
    return errorResponse(msg || "Internal server error", 500);
  }
}
