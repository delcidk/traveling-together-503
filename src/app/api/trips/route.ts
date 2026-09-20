import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { CreateTripSchema, Trip } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await verifyAuthToken(request); // Solo auth para leer (admins y clientes)
    const snapshot = await adminDb.collection("trips").orderBy("fechaSalida", "desc").get();
    
    const trips: Trip[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        rutaId: data.rutaId,
        vehiculoId: data.vehiculoId,
        conductor: data.conductor,
        fechaSalida: data.fechaSalida.toDate(),
        estado: data.estado,
        asientosOcupados: data.asientosOcupados,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return jsonResponse(trips);
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
    await verifyAdmin(decodedToken.uid);

    const body = (await parseBody(request)) as any;
    // Convert string date to Date object if needed
    if (typeof body.fechaSalida === 'string') {
      body.fechaSalida = new Date(body.fechaSalida);
    }
    const parsedData = CreateTripSchema.parse(body);

    const newTripRef = adminDb.collection("trips").doc();
    const tripData = {
      ...parsedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await newTripRef.set(tripData);

    return jsonResponse({
      id: newTripRef.id,
      ...tripData,
    }, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(error.errors, 400);
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
