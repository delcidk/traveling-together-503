import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { UpdateReservationSchema } from "@/lib/types";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedToken = await verifyAuthToken(request);
    
    const doc = await adminDb.collection("reservations").doc(id).get();
    
    if (!doc.exists) {
      return errorResponse("Reservation not found", 404);
    }

    const data = doc.data()!;
    
    // Check ownership or admin status
    if (data.userId !== decodedToken.uid) {
      await verifyAdmin(decodedToken.uid); // Will throw if not admin
    }

    return jsonResponse({
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
    
    const docRef = adminDb.collection("reservations").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Reservation not found", 404);
    }

    const data = doc.data()!;
    
    let isAdmin = false;
    try {
      isAdmin = await verifyAdmin(decodedToken.uid);
    } catch {
      // not admin
    }

    if (data.userId !== decodedToken.uid && !isAdmin) {
      return errorResponse("Forbidden: you can only update your own reservations", 403);
    }

    const body = await parseBody(request);
    const parsedData = UpdateReservationSchema.parse(body);

    const updateData: any = { updatedAt: new Date() };
    
    // Lógica de negocio para actualización de estado:
    // Cliente solo puede cancelar. Admin puede cambiar a confirmada, completada, etc.
    if (parsedData.estado !== undefined) {
      if (!isAdmin && parsedData.estado !== "cancelada") {
        return errorResponse("Forbidden: clients can only cancel reservations", 403);
      }
      updateData.estado = parsedData.estado;
    }

    // Comprobante
    if (parsedData.comprobanteUrl !== undefined) {
      updateData.comprobanteUrl = parsedData.comprobanteUrl;
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data()!;
    
    return jsonResponse({
      id: updatedDoc.id,
      userId: updatedData.userId,
      vehiculoId: updatedData.vehiculoId,
      rutaId: updatedData.rutaId,
      origen: updatedData.origen,
      destino: updatedData.destino,
      fechaViaje: updatedData.fechaViaje.toDate(),
      pasajeros: updatedData.pasajeros,
      precioTotal: updatedData.precioTotal,
      estado: updatedData.estado,
      comprobanteUrl: updatedData.comprobanteUrl,
      createdAt: updatedData.createdAt.toDate(),
      updatedAt: updatedData.updatedAt.toDate(),
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

    const docRef = adminDb.collection("reservations").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Reservation not found", 404);
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
