import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { UpdateReservationSchema } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function toDate(value: unknown): Date {
  if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function serializeReservation(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    viajeId: data.viajeId,
    rutaId: data.rutaId || undefined,
    rutaNombre: data.rutaNombre || undefined,
    fechaSalida: data.fechaSalida ? toDate(data.fechaSalida) : undefined,
    vehiculoId: data.vehiculoId || undefined,
    userId: data.userId || undefined,
    clienteNombre: data.clienteNombre,
    clienteTelefono: data.clienteTelefono,
    pasajeros: data.pasajeros,
    precioTotal: data.precioTotal,
    estado: data.estado,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);

    let isAdmin = decodedToken.admin === true;
    if (!isAdmin) {
      try {
        await verifyAdmin(decodedToken.uid, decodedToken.admin);
        isAdmin = true;
      } catch {
        isAdmin = false;
      }
    }

    const doc = await adminDb.collection("reservations").doc(id).get();

    if (!doc.exists) {
      return errorResponse("Reservation not found", 404);
    }

    const data = doc.data()!;

    if (!isAdmin && data.userId !== decodedToken.uid) {
      return errorResponse("Forbidden: You do not own this reservation", 403);
    }

    return jsonResponse(serializeReservation(doc.id, data));
  } catch (error: any) {
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return errorResponse(error.message, 401);
    }
    if (error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);

    let isAdmin = decodedToken.admin === true;
    if (!isAdmin) {
      try {
        await verifyAdmin(decodedToken.uid, decodedToken.admin);
        isAdmin = true;
      } catch {
        isAdmin = false;
      }
    }

    const body = await parseBody(request);
    const parsedData = UpdateReservationSchema.parse(body);

    const docRef = adminDb.collection("reservations").doc(id);

    await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      if (!doc.exists) {
        throw new Error("NOT_FOUND:Reservation not found");
      }

      const currentData = doc.data()!;

      if (!isAdmin) {
        // Non-admin owners may ONLY cancel their own "pendiente" reservation
        if (currentData.userId !== decodedToken.uid) {
          throw new Error("Forbidden: You do not own this reservation");
        }
        const allowedKeys = Object.keys(parsedData).filter(
          (k) => parsedData[k as keyof typeof parsedData] !== undefined
        );
        if (
          allowedKeys.length !== 1 ||
          allowedKeys[0] !== "estado" ||
          parsedData.estado !== "cancelada"
        ) {
          throw new Error("Forbidden: Clients can only cancel their own reservations");
        }
        if (currentData.estado !== "pendiente") {
          throw new Error(
            "VALIDATION:Solo puedes cancelar reservaciones en estado pendiente"
          );
        }
      }

      const oldEstado: string = currentData.estado;
      const newEstado: string = parsedData.estado ?? oldEstado;
      const oldPasajeros: number = Number(currentData.pasajeros || 0);
      const newPasajeros: number =
        parsedData.pasajeros !== undefined ? Number(parsedData.pasajeros) : oldPasajeros;
      const oldViajeId: string = currentData.viajeId;
      const newViajeId: string = parsedData.viajeId ?? oldViajeId;

      const wasActive = oldEstado !== "cancelada";
      const isNowActive = newEstado !== "cancelada";

      const updateData: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (parsedData.estado !== undefined) updateData.estado = parsedData.estado;
      if (parsedData.viajeId !== undefined) updateData.viajeId = parsedData.viajeId;
      if (parsedData.userId !== undefined) updateData.userId = parsedData.userId;
      if (parsedData.clienteNombre !== undefined) updateData.clienteNombre = parsedData.clienteNombre;
      if (parsedData.clienteTelefono !== undefined) updateData.clienteTelefono = parsedData.clienteTelefono;
      if (parsedData.pasajeros !== undefined) updateData.pasajeros = parsedData.pasajeros;
      if (parsedData.precioTotal !== undefined) updateData.precioTotal = parsedData.precioTotal;

      // Seat adjustment logic
      if (oldViajeId === newViajeId) {
        let delta = 0;
        if (wasActive && !isNowActive) {
          delta = -oldPasajeros;
        } else if (!wasActive && isNowActive) {
          delta = newPasajeros;
        } else if (wasActive && isNowActive && newPasajeros !== oldPasajeros) {
          delta = newPasajeros - oldPasajeros;
        }

        if (delta !== 0 && oldViajeId) {
          const tripRef = adminDb.collection("trips").doc(oldViajeId);
          const tripDoc = await tx.get(tripRef);
          if (tripDoc.exists) {
            const tripData = tripDoc.data()!;
            const currentOccupied = Number(tripData.asientosOcupados || 0);

            if (delta > 0 && tripData.vehiculoId) {
              const vehicleDoc = await tx.get(
                adminDb.collection("vehicles").doc(tripData.vehiculoId)
              );
              const capacidad = vehicleDoc.exists
                ? Number(vehicleDoc.data()?.capacidad || 0)
                : 0;
              if (capacidad > 0 && currentOccupied + delta > capacidad) {
                const disponibles = Math.max(0, capacidad - currentOccupied);
                throw new Error(
                  `VALIDATION:No hay suficientes asientos disponibles (disponibles: ${disponibles})`
                );
              }
            }

            tx.update(tripRef, {
              asientosOcupados: Math.max(0, currentOccupied + delta),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
      } else {
        // Trip changed (admin reassigned reservation to another trip)
        const oldTripRef = oldViajeId ? adminDb.collection("trips").doc(oldViajeId) : null;
        const newTripRef = adminDb.collection("trips").doc(newViajeId);

        const [oldTripDoc, newTripDoc] = await Promise.all([
          oldTripRef ? tx.get(oldTripRef) : Promise.resolve(null),
          tx.get(newTripRef),
        ]);

        if (!newTripDoc.exists) {
          throw new Error("NOT_FOUND:El nuevo viaje seleccionado no existe");
        }

        const newTripData = newTripDoc.data()!;
        const newTripOccupied = Number(newTripData.asientosOcupados || 0);

        // Fetch route & vehicle info for the new trip to keep denormalized fields accurate
        const [newRouteDoc, newVehicleDoc] = await Promise.all([
          newTripData.rutaId
            ? tx.get(adminDb.collection("routes").doc(newTripData.rutaId))
            : Promise.resolve(null),
          newTripData.vehiculoId
            ? tx.get(adminDb.collection("vehicles").doc(newTripData.vehiculoId))
            : Promise.resolve(null),
        ]);

        if (isNowActive && newVehicleDoc && newVehicleDoc.exists) {
          const capacidad = Number(newVehicleDoc.data()?.capacidad || 0);
          if (capacidad > 0 && newTripOccupied + newPasajeros > capacidad) {
            const disponibles = Math.max(0, capacidad - newTripOccupied);
            throw new Error(
              `VALIDATION:No hay suficientes asientos disponibles en el nuevo viaje (disponibles: ${disponibles})`
            );
          }
        }

        const newRouteData = newRouteDoc?.exists ? newRouteDoc.data() : null;
        updateData.rutaId = newTripData.rutaId || "";
        updateData.rutaNombre = newRouteData
          ? `${newRouteData.origen} → ${newRouteData.destino}`
          : currentData.rutaNombre || "Ruta programada";
        updateData.fechaSalida = newTripData.fechaSalida || null;
        updateData.vehiculoId = newTripData.vehiculoId || "";

        if (wasActive && oldTripRef && oldTripDoc && oldTripDoc.exists) {
          const oldOccupied = Number(oldTripDoc.data()?.asientosOcupados || 0);
          tx.update(oldTripRef, {
            asientosOcupados: Math.max(0, oldOccupied - oldPasajeros),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        if (isNowActive) {
          tx.update(newTripRef, {
            asientosOcupados: newTripOccupied + newPasajeros,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      tx.update(docRef, updateData);
    });

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data()!;

    return jsonResponse(serializeReservation(updatedDoc.id, updatedData));
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(error.errors, 400);
    }
    if (typeof error.message === "string" && error.message.startsWith("NOT_FOUND:")) {
      return errorResponse(error.message.replace("NOT_FOUND:", ""), 404);
    }
    if (typeof error.message === "string" && error.message.startsWith("VALIDATION:")) {
      return errorResponse(error.message.replace("VALIDATION:", ""), 400);
    }
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return errorResponse(error.message, 401);
    }
    if (error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid, decodedToken.admin);

    const docRef = adminDb.collection("reservations").doc(id);

    await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      if (!doc.exists) {
        throw new Error("NOT_FOUND:Reservation not found");
      }

      const data = doc.data()!;
      const wasActive = data.estado !== "cancelada";
      const pasajeros = Number(data.pasajeros || 0);

      if (wasActive && data.viajeId && pasajeros > 0) {
        const tripRef = adminDb.collection("trips").doc(data.viajeId);
        const tripDoc = await tx.get(tripRef);
        if (tripDoc.exists) {
          const currentOccupied = Number(tripDoc.data()?.asientosOcupados || 0);
          tx.update(tripRef, {
            asientosOcupados: Math.max(0, currentOccupied - pasajeros),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      tx.delete(docRef);
    });

    return jsonResponse({ success: true }, 200);
  } catch (error: any) {
    if (typeof error.message === "string" && error.message.startsWith("NOT_FOUND:")) {
      return errorResponse(error.message.replace("NOT_FOUND:", ""), 404);
    }
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return errorResponse(error.message, 401);
    }
    if (error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    return errorResponse(error.message || "Internal server error", 500);
  }
}
