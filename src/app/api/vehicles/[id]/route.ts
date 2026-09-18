import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { UpdateVehicleSchema } from "@/lib/types";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("vehicles").doc(id).get();
    
    if (!doc.exists) {
      return errorResponse("Vehicle not found", 404);
    }

    const data = doc.data()!;
    return jsonResponse({
      id: doc.id,
      nombre: data.nombre,
      tipo: data.tipo,
      capacidad: data.capacidad,
      estado: data.estado,
      imagenUrl: data.imagenUrl,
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
    const parsedData = UpdateVehicleSchema.parse(body);

    const docRef = adminDb.collection("vehicles").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Vehicle not found", 404);
    }

    // Filtrar undefined
    const updateData: any = { updatedAt: new Date() };
    if (parsedData.nombre !== undefined) updateData.nombre = parsedData.nombre;
    if (parsedData.tipo !== undefined) updateData.tipo = parsedData.tipo;
    if (parsedData.capacidad !== undefined) updateData.capacidad = parsedData.capacidad;
    if (parsedData.estado !== undefined) updateData.estado = parsedData.estado;
    if (parsedData.imagenUrl !== undefined) updateData.imagenUrl = parsedData.imagenUrl;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    
    return jsonResponse({
      id: updatedDoc.id,
      nombre: data.nombre,
      tipo: data.tipo,
      capacidad: data.capacidad,
      estado: data.estado,
      imagenUrl: data.imagenUrl,
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

    const docRef = adminDb.collection("vehicles").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Vehicle not found", 404);
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
