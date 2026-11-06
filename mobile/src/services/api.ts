import { signOut } from "firebase/auth";
import { API_URL } from "../config/constants";
import { auth } from "../config/firebase";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function performFetch(url: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Error de conexión con el servidor. Verifica tu conexión a internet.",
      0
    );
  }
}

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  let res = await performFetch(url, options);

  const headersObj = (options.headers || {}) as Record<string, string>;
  const hasBearer = Boolean(headersObj.Authorization?.startsWith("Bearer "));

  if (res.status === 401 && hasBearer && auth.currentUser) {
    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      res = await performFetch(url, {
        ...options,
        headers: {
          ...headersObj,
          Authorization: `Bearer ${freshToken}`,
        },
      });
    } catch {
      await signOut(auth).catch(() => {});
      throw new ApiError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401);
    }

    if (res.status === 401) {
      await signOut(auth).catch(() => {});
      throw new ApiError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401);
    }
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(
      `Respuesta inválida del servidor (HTTP ${res.status})`,
      res.status
    );
  }

  if (!res.ok || !json?.success) {
    const errorMsg = json?.error || `Error ${res.status}: ${res.statusText}`;
    throw new ApiError(
      typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
      res.status
    );
  }

  return json.data;
}

export function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
