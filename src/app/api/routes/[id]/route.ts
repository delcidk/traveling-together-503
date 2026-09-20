import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { UpdateRouteSchema } from "@/lib/types";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("routes").doc(id).get();
    
    if (!doc.exists) {
      return errorResponse("Route not found", 404);
    }

    const data = doc.data()!;
    return jsonResponse({
      id: doc.id,
      origen: data.origen,
      destino: data.destino,
      distanciaKm: data.distanciaKm,
      tarifaBase: data.tarifaBase,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl,
      galeria: data.galeria || [],
      activa: data.activa,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid);

    const body = await parseBody(request);
    const parsedData = UpdateRouteSchema.parse(body);

    const docRef = adminDb.collection("routes").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Route not found", 404);
    }

    const updateData: any = { updatedAt: new Date() };
    if (parsedData.origen !== undefined) updateData.origen = parsedData.origen;
    if (parsedData.destino !== undefined) updateData.destino = parsedData.destino;
    if (parsedData.distanciaKm !== undefined) updateData.distanciaKm = parsedData.distanciaKm;
    if (parsedData.tarifaBase !== undefined) updateData.tarifaBase = parsedData.tarifaBase;
    if (parsedData.descripcion !== undefined) updateData.descripcion = parsedData.descripcion;
    if (parsedData.imagenUrl !== undefined) updateData.imagenUrl = parsedData.imagenUrl;
    if (parsedData.galeria !== undefined) updateData.galeria = parsedData.galeria;
    if (parsedData.activa !== undefined) updateData.activa = parsedData.activa;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    
    return jsonResponse({
      id: updatedDoc.id,
      origen: data.origen,
      destino: data.destino,
      distanciaKm: data.distanciaKm,
      tarifaBase: data.tarifaBase,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl,
      galeria: data.galeria || [],
      activa: data.activa,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid);

    const docRef = adminDb.collection("routes").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Route not found", 404);
    }

    await docRef.delete();

    return jsonResponse({ success: true }, 200);
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
