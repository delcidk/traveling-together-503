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
    await verifyAdmin(decodedToken.uid);
    
    const doc = await adminDb.collection("reservations").doc(id).get();
    
    if (!doc.exists) {
      return errorResponse("Reservation not found", 404);
    }

    const data = doc.data()!;

    return jsonResponse({
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
    await verifyAdmin(decodedToken.uid);
    
    const docRef = adminDb.collection("reservations").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return errorResponse("Reservation not found", 404);
    }

    const body = await parseBody(request);
    const parsedData = UpdateReservationSchema.parse(body);

    const updateData: any = { updatedAt: new Date() };
    
    if (parsedData.estado !== undefined) updateData.estado = parsedData.estado;
    if (parsedData.viajeId !== undefined) updateData.viajeId = parsedData.viajeId;
    if (parsedData.userId !== undefined) updateData.userId = parsedData.userId;
    if (parsedData.clienteNombre !== undefined) updateData.clienteNombre = parsedData.clienteNombre;
    if (parsedData.clienteTelefono !== undefined) updateData.clienteTelefono = parsedData.clienteTelefono;
    if (parsedData.pasajeros !== undefined) updateData.pasajeros = parsedData.pasajeros;
    if (parsedData.precioTotal !== undefined) updateData.precioTotal = parsedData.precioTotal;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data()!;
    
    return jsonResponse({
      id: updatedDoc.id,
      viajeId: updatedData.viajeId,
      userId: updatedData.userId || undefined,
      clienteNombre: updatedData.clienteNombre,
      clienteTelefono: updatedData.clienteTelefono,
      pasajeros: updatedData.pasajeros,
      precioTotal: updatedData.precioTotal,
      estado: updatedData.estado,
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
