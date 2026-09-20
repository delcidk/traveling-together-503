import { NextResponse } from "next/server";
import { adminDb } from "./firebase-admin";
import { ApiResponse } from "./types";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status }
  );
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json<ApiResponse<any>>(
    { success: false, error },
    { status }
  );
}

export async function verifyAuthToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
      cache: 'no-store'
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.users || data.users.length === 0) throw new Error("Invalid token");
    
    const user = data.users[0];
    return { uid: user.localId, email: user.email };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Verifica usuario con permisos de administrador en firebase
export async function verifyAdmin(uid: string) {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  
  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }
  
  const userData = userDoc.data();
  if (userData?.rol !== "admin") {
    throw new Error("Forbidden: requires admin privileges");
  }
  
  return true;
}

// Helper para parsear JSON bodies
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}
