import { ApiRoute } from "../types/route";

export function getDurationHours(distanciaKm: number): string {
  const baseHours = Math.max(1, Math.ceil(distanciaKm / 60));
  return `${baseHours}-${baseHours + 1} hrs`;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)} USD`;
}

export function formatPriceDetail(price: number): string {
  return `$${price.toFixed(2)} USD`;
}

export function countByCategory(routes: ApiRoute[]): Record<string, number> {
  const counts: Record<string, number> = {
    todos: routes.length,
    playa: 0,
    internacional: 0,
    aeropuerto: 0,
    ciudad: 0,
    escenico: 0,
  };

  routes.forEach((r) => {
    if (r.categoria && counts[r.categoria] !== undefined) {
      counts[r.categoria]++;
    }
  });

  return counts;
}

export function filterByCategory(routes: ApiRoute[], category: string): ApiRoute[] {
  if (!category || category === "todos") return routes;
  return routes.filter((r) => r.categoria === category);
}

export function buildQuoteMessage(
  route: ApiRoute,
  pasajeros: number,
  fecha: string
): string {
  const precioTotal = (route.tarifaBase * pasajeros).toFixed(2);
  return `Hola, me gustaría cotizar un viaje privado:\n\n📍 *Ruta:* ${route.origen} ➔ ${route.destino}\n👥 *Pasajeros:* ${pasajeros}\n📅 *Fecha:* ${fecha}\n💵 *Cotización estimada:* $${precioTotal} USD\n\n¿Tienen disponibilidad para esta fecha?`;
}

export function buildGeneralInquiryMessage(route: ApiRoute): string {
  return `Hola, me gustaría consultar información sobre la ruta *${route.origen} ➔ ${route.destino}*.`;
}
