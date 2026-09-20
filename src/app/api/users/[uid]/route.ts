import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { UpdateUserSchema } from "@/lib/types";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ uid: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { uid } = await params;
    const decodedToken = await verifyAuthToken(request);
    
    // Solo puede ver el perfil el propio usuario o un admin
    if (decodedToken.uid !== uid) {
      await verifyAdmin(decodedToken.uid);
    }

    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) {
      return errorResponse("User not found", 404);
    }

    const data = doc.data()!;
    return jsonResponse({
      uid: doc.id,
      email: data.email,
      nombre: data.nombre,
      rol: data.rol,
      telefono: data.telefono,
      createdAt: data.createdAt.toDate(),
    });
  } catch (error: any) {
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return errorResponse(error.message, 401);
    }
    if (error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { uid } = await params;
    const decodedToken = await verifyAuthToken(request);
    
    let isAdmin = false;
    try {
      isAdmin = await verifyAdmin(decodedToken.uid);
    } catch {
      // no es admin
    }

    if (decodedToken.uid !== uid && !isAdmin) {
      return errorResponse("Forbidden: you can only update your own profile", 403);
    }

    const body = await parseBody(request);
    const parsedData = UpdateUserSchema.parse(body);

    // Solo un admin puede cambiar el rol
    if (parsedData.rol && !isAdmin) {
      return errorResponse("Forbidden: only admins can change roles", 403);
    }

    const docRef = adminDb.collection("users").doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      return errorResponse("User not found", 404);
    }

    // Filtramos undefined
    const updateData: any = {};
    if (parsedData.nombre !== undefined) updateData.nombre = parsedData.nombre;
    if (parsedData.telefono !== undefined) updateData.telefono = parsedData.telefono;
    if (parsedData.rol !== undefined && isAdmin) updateData.rol = parsedData.rol;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    
    return jsonResponse({
      uid: updatedDoc.id,
      email: data.email,
      nombre: data.nombre,
      rol: data.rol,
      telefono: data.telefono,
      createdAt: data.createdAt.toDate(),
    });
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
