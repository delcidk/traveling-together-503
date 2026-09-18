import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "./firebase-admin";
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

/**
 * Extracts and verifies the Firebase JWT token from the Authorization header.
 * Returns the decoded token if valid, throws an error if missing or invalid.
 */
export async function verifyAuthToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Verifies if the user corresponding to the given uid has the 'admin' role in Firestore.
 * Throws an error if they are not an admin.
 */
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

/**
 * Helper to safely parse JSON bodies
 */
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}
