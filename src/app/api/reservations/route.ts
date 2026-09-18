import { adminDb } from "@/lib/firebase-admin";
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
      // not an admin
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

    // Ordenar por fecha de creación descendente (requerirá un índice compuesto en Firestore si se usa junto con where)
    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();
    const reservations: Reservation[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        userId: data.userId,
        vehiculoId: data.vehiculoId,
        rutaId: data.rutaId,
        origen: data.origen,
        destino: data.destino,
        fechaViaje: data.fechaViaje.toDate(),
        pasajeros: data.pasajeros,
        precioTotal: data.precioTotal,
        estado: data.estado,
        comprobanteUrl: data.comprobanteUrl,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

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

    const newResRef = adminDb.collection("reservations").doc();
    const resData = {
      ...parsedData,
      userId: decodedToken.uid,
      estado: "pendiente",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await newResRef.set(resData);

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
