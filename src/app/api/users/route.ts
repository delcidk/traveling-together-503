import { adminDb } from "@/lib/firebase-admin";
import { errorResponse, jsonResponse, parseBody, verifyAuthToken, verifyAdmin } from "@/lib/api-helpers";
import { CreateUserSchema, User } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    await verifyAdmin(decodedToken.uid, decodedToken.admin);

    const snapshot = await adminDb.collection("users").get();
    const users: User[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        telefono: data.telefono,
        createdAt: data.createdAt.toDate(),
      });
    });

    return jsonResponse(users);
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

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    
    // Verifica si el usuario ya existe (idempotente para primer login con Google o reintentos)
    const existingUser = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (existingUser.exists) {
      const data = existingUser.data()!;
      return jsonResponse({
        uid: existingUser.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        telefono: data.telefono,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      }, 200);
    }

    const body = await parseBody(request);
    const parsedData = CreateUserSchema.parse(body);

    const userData = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      nombre: parsedData.nombre,
      rol: "cliente", // Rol por defecto
      telefono: parsedData.telefono || null,
      createdAt: new Date(),
    };

    await adminDb.collection("users").doc(decodedToken.uid).set(userData);

    return jsonResponse(userData, 201);
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
