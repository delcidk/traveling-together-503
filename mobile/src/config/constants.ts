export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000";
export const WHATSAPP_NUMBER = "50369557127";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const DEFAULT_CAPACITY = 8;
export const DEFAULT_INCLUDES = [
  "A/C",
  "WiFi",
  "Agua incluida",
  "Paradas de descanso",
];

export const CATEGORY_LABELS: Record<string, string> = {
  todos: "Todos",
  playa: "Playa",
  internacional: "Internacional",
  aeropuerto: "Aeropuerto",
  ciudad: "Ciudad",
  escenico: "Escénico",
};

export function buildWhatsAppUrl(text?: string): string {
  if (!text) return WHATSAPP_URL;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
