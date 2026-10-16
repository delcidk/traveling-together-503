import { API_URL } from "../config/constants";

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  const json = await res.json();
  
  if (!res.ok || !json.success) {
    const errorMsg = json.error || `Error ${res.status}: ${res.statusText}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
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
