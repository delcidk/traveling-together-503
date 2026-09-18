import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { CreateRouteSchema, Route } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activaParam = searchParams.get("activa");

    let query: FirebaseFirestore.Query = adminDb.collection("routes");

    if (activaParam !== null) {
      const activa = activaParam === "true";
      query = query.where("activa", "==", activa);
    }

    const snapshot = await query.get();
    const routes: Route[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      routes.push({
        id: doc.id,
        origen: data.origen,
        destino: data.destino,
        distanciaKm: data.distanciaKm,
        tarifaBase: data.tarifaBase,
        descripcion: data.descripcion,
        imagenUrl: data.imagenUrl,
        activa: data.activa,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return jsonResponse(routes);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid);

    const body = await parseBody(request);
    const parsedData = CreateRouteSchema.parse(body);

    const newRouteRef = adminDb.collection("routes").doc();
    const routeData = {
      ...parsedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await newRouteRef.set(routeData);

    return jsonResponse({
      id: newRouteRef.id,
      ...routeData,
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
