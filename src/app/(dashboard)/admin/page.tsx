"use client";

import { useMemo } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useVehiclesContext } from "../../context/VehiclesContext";
import { useReservationContext } from "../../context/ReservationContext";
import { useRoutesContext } from "../../context/RoutesContext";

// Componente Tarjeta de Métrica (Reutilizable localmente)
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  loading, 
  icon 
}: { 
  title: string, 
  value: number | string, 
  subtitle?: string, 
  loading: boolean, 
  icon: React.ReactNode 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center">
      <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {loading ? (
          <div className="h-8 bg-gray-200 rounded w-16 mt-1 animate-pulse" />
        ) : (
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        )}
        {subtitle && !loading && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Iconos SVG puros
const Icons = {
  Reservations: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Pending: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Fleet: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Routes: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
};

export default function AdminPage() {
  const { reservations, loadingReservations } = useReservationContext();
  const { vehicles, loadingVehicles } = useVehiclesContext();
  const { routes, loadingRoutes } = useRoutesContext();

  // Computar métricas utilizando useMemo para optimización
  const metrics = useMemo(() => {
    const resList = reservations || [];
    const vehList = vehicles || [];
    const rouList = routes || [];

    const totalReservations = resList.length;
    const pendingReservations = resList.filter((r: any) => r.estado === "pendiente").length;
    const availableVehicles = vehList.filter((v: any) => v.estado === "disponible").length;
    const totalVehicles = vehList.length;
    const activeRoutes = rouList.filter((r: any) => r.activa).length;

    return {
      totalReservations,
      pendingReservations,
      availableVehicles,
      totalVehicles,
      activeRoutes,
      totalRoutes: rouList.length
    };
  }, [reservations, vehicles, routes]);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control General</h1>
          <p className="text-gray-600 mt-1">Resumen de la operación de Traveling Together 503</p>
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Reservas Totales"
            value={metrics.totalReservations}
            loading={loadingReservations && reservations.length === 0}
            icon={Icons.Reservations}
          />
          <MetricCard
            title="Reservas Pendientes"
            value={metrics.pendingReservations}
            subtitle="Esperando confirmación"
            loading={loadingReservations && reservations.length === 0}
            icon={Icons.Pending}
          />
          <MetricCard
            title="Flota Disponible"
            value={`${metrics.availableVehicles} / ${metrics.totalVehicles}`}
            subtitle="Vehículos listos para operar"
            loading={loadingVehicles && vehicles.length === 0}
            icon={Icons.Fleet}
          />
          <MetricCard
            title="Rutas Activas"
            value={`${metrics.activeRoutes} / ${metrics.totalRoutes}`}
            subtitle="Destinos turísticos habilitados"
            loading={loadingRoutes && routes.length === 0}
            icon={Icons.Routes}
          />
        </div>

        {/* Seccin Placeholder para Prximas Fases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas Reservaciones (Próximamente)</h3>
            <div className="bg-gray-50 rounded p-8 text-center text-gray-500 border border-dashed border-gray-300">
              La tabla de reservaciones recientes se implementará en la fase correspondiente.
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estado de Flota (Próximamente)</h3>
            <div className="bg-gray-50 rounded p-8 text-center text-gray-500 border border-dashed border-gray-300">
              El panel de gestión y despacho de flota se implementará en el Módulo 2.
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
