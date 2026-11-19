"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reservation } from "@/lib/types";
import { toast } from "react-hot-toast";

type FilterStatus = "todas" | "pendiente" | "confirmada" | "pagada" | "cancelada";

const FILTER_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "confirmada", label: "Confirmadas" },
  { key: "pagada", label: "Pagadas" },
  { key: "cancelada", label: "Canceladas" },
];

export default function MisReservasPage() {
  const { user, userProfile, getToken, logout } = useAuth();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("todas");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMyReservations = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await fetch("/api/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success !== false) {
        const data = Array.isArray(json) ? json : json.data || [];
        setReservations(data);
      }
    } catch (error) {
      console.error("Error fetching reservations", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user) {
      fetchMyReservations();
    }
  }, [user, fetchMyReservations]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleCancelReservation = async (resItem: Reservation) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas cancelar tu reserva para "${
        resItem.rutaNombre || "este viaje"
      }"?`
    );
    if (!confirmed) return;

    try {
      setCancellingId(resItem.id);
      const token = await getToken();
      if (!token) throw new Error("Sesión expirada");

      const response = await fetch(`/api/reservations/${resItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: "cancelada" }),
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new Error(json.error || "No se pudo cancelar la reserva");
      }

      setReservations((prev) =>
        prev.map((item) =>
          item.id === resItem.id ? { ...item, estado: "cancelada" } : item
        )
      );
      toast.success("Reserva cancelada correctamente");
    } catch (err: any) {
      toast.error(err?.message || "Ocurrió un error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  const handleWhatsAppSupport = (resItem: Reservation) => {
    const msg = `Hola, consulto por mi reservación #${resItem.id.slice(0, 8).toUpperCase()} (${
      resItem.rutaNombre || "Ruta programada"
    }, ${resItem.pasajeros} pasajero${resItem.pasajeros > 1 ? "s" : ""}).`;
    const url = `https://wa.me/50369557127?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const filteredReservations = useMemo(() => {
    if (statusFilter === "todas") return reservations;
    return reservations.filter((r) => r.estado === statusFilter);
  }, [reservations, statusFilter]);

  const activas = reservations.filter(
    (r) => r.estado === "pendiente" || r.estado === "confirmada"
  ).length;
  const completadas = reservations.filter((r) => r.estado === "pagada").length;

  const formatDate = (value?: Date | string) => {
    if (!value) return "Fecha por confirmar";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Fecha por confirmar";
    return d.toLocaleDateString("es-SV", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayName = userProfile?.nombre || user?.displayName || "Usuario";
  const displayEmail = userProfile?.email || user?.email || "";

  return (
    <ProtectedRoute requiredRole="cliente">
      <div className="min-h-screen bg-gray-50">
        {/* Topbar */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
              TRAVELING TOGETHER <span className="text-gray-500">503</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Catálogo de Rutas
              </Link>
              <Link href="/perfil" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Mi Perfil
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Perfil de Usuario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-900 text-white font-bold text-2xl flex items-center justify-center rounded-xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-gray-500 text-sm">{displayEmail}</p>
                {userProfile?.telefono && (
                  <p className="text-gray-400 text-xs mt-0.5">{userProfile.telefono}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/perfil"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Editar Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <span>Salir</span>
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-3xl font-extrabold text-gray-900 mb-1">
                {reservations.length}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Total
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{activas}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                En Proceso
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-3xl font-extrabold text-gray-900 mb-1">
                {completadas}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Pagadas
              </div>
            </div>
          </div>

          {/* Filtros por Estado */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_OPTIONS.map((opt) => {
              const active = statusFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Lista de Reservas */}
          {loading ? (
            <div className="text-center text-gray-500 py-12">
              Cargando tus reservas...
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {statusFilter === "todas"
                  ? "Sin reservas todavía"
                  : `Sin reservas ${statusFilter}s`}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md text-sm">
                {statusFilter === "todas"
                  ? "Explora nuestras rutas y cotiza tu próximo viaje."
                  : "No tienes reservaciones con este estado actualmente."}
              </p>
              <Link
                href="/"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Ver rutas disponibles
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((resItem: Reservation) => {
                const isCancelling = cancellingId === resItem.id;
                return (
                  <div
                    key={resItem.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {resItem.rutaNombre || "Ruta programada"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Reserva #{resItem.id.slice(0, 8).toUpperCase()} • Solicitada el{" "}
                          {formatDate(resItem.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`self-start sm:self-auto px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                          resItem.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : resItem.estado === "confirmada"
                            ? "bg-blue-100 text-blue-800"
                            : resItem.estado === "pagada"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {resItem.estado.toUpperCase()}
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-400 block uppercase">
                          Fecha de salida
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatDate(resItem.fechaSalida)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block uppercase">
                          Pasajeros
                        </span>
                        <span className="font-medium text-gray-900">
                          {resItem.pasajeros} pasajero{resItem.pasajeros > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block uppercase">
                          Total
                        </span>
                        <span className="font-bold text-gray-900">
                          ${Number(resItem.precioTotal || 0).toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleWhatsAppSupport(resItem)}
                        className="px-3.5 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
                      >
                        Consultar por WhatsApp
                      </button>

                      {resItem.estado === "pendiente" && (
                        <button
                          type="button"
                          onClick={() => handleCancelReservation(resItem)}
                          disabled={isCancelling}
                          className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 disabled:opacity-60 transition-colors"
                        >
                          {isCancelling ? "Cancelando..." : "Cancelar reserva"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
