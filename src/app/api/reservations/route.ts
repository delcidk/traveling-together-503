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
      isAdmin = await verifyAdmin(decodedToken.uid);
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
      reservations.push({
        id: doc.id,
        viajeId: data.viajeId,
        userId: data.userId || undefined,
        clienteNombre: data.clienteNombre,
        clienteTelefono: data.clienteTelefono,
        pasajeros: data.pasajeros,
        precioTotal: data.precioTotal,
        estado: data.estado,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
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

    const body = await parseBody(request);
    const parsedData = CreateReservationSchema.parse(body);

    // Obtener el viaje para verificar disponibilidad (opcional pero recomendado)
    const tripRef = adminDb.collection("trips").doc(parsedData.viajeId);
    const tripDoc = await tripRef.get();
    if (!tripDoc.exists) {
      return errorResponse("El viaje especificado no existe", 404);
    }

    const newResRef = adminDb.collection("reservations").doc();
    const resData = {
      ...parsedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Usar un batch para guardar la reserva y actualizar los asientos del viaje
    const batch = adminDb.batch();
    batch.set(newResRef, resData);
    
    // Incrementar los asientos ocupados
    batch.update(tripRef, {
      asientosOcupados: FieldValue.increment(parsedData.pasajeros),
      updatedAt: new Date()
    });

    await batch.commit();

    return jsonResponse({
      id: newResRef.id,
      ...resData,
    }, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(error.errors, 400);
    }
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message || "Internal server error", 500);
  }
}
