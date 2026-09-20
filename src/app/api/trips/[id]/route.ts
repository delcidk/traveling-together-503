import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { UpdateTripSchema } from "@/lib/types";
import { NextRequest } from "next/server";

interface TripParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: TripParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid);

    const body = (await parseBody(request)) as any;
    if (typeof body.fechaSalida === 'string') {
      body.fechaSalida = new Date(body.fechaSalida);
    }
    const parsedData = UpdateTripSchema.parse(body);

    const docRef = adminDb.collection("trips").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Trip not found", 404);
    }

    const updateData: any = { updatedAt: new Date() };
    if (parsedData.rutaId !== undefined) updateData.rutaId = parsedData.rutaId;
    if (parsedData.vehiculoId !== undefined) updateData.vehiculoId = parsedData.vehiculoId;
    if (parsedData.conductor !== undefined) updateData.conductor = parsedData.conductor;
    if (parsedData.fechaSalida !== undefined) updateData.fechaSalida = parsedData.fechaSalida;
    if (parsedData.estado !== undefined) updateData.estado = parsedData.estado;
    if (parsedData.asientosOcupados !== undefined) updateData.asientosOcupados = parsedData.asientosOcupados;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    
    return jsonResponse({
      id: updatedDoc.id,
      rutaId: data.rutaId,
      vehiculoId: data.vehiculoId,
      conductor: data.conductor,
      fechaSalida: data.fechaSalida.toDate(),
      estado: data.estado,
      asientosOcupados: data.asientosOcupados,
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

export async function DELETE(request: NextRequest, { params }: TripParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid);

    const docRef = adminDb.collection("trips").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Trip not found", 404);
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
