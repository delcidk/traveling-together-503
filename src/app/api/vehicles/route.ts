import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { CreateVehicleSchema, Vehicle } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const estado = searchParams.get("estado");

    let query: FirebaseFirestore.Query = adminDb.collection("vehicles");

    if (tipo) {
      query = query.where("tipo", "==", tipo);
    }
    if (estado) {
      query = query.where("estado", "==", estado);
    }

    const snapshot = await query.get();
    const vehicles: Vehicle[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      vehicles.push({
        id: doc.id,
        nombre: data.nombre,
        tipo: data.tipo,
        capacidad: data.capacidad,
        estado: data.estado,
        imagenUrl: data.imagenUrl,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return jsonResponse(vehicles);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid);

    const body = await parseBody(request);
    const parsedData = CreateVehicleSchema.parse(body);

    const newVehicleRef = adminDb.collection("vehicles").doc();
    const vehicleData = {
      ...parsedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await newVehicleRef.set(vehicleData);

    return jsonResponse({
      id: newVehicleRef.id,
      ...vehicleData,
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
