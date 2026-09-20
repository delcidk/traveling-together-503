"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reservation } from "@/lib/types";

export default function MisReservasPage() {
  const { userProfile, getToken, logout } = useAuth();
  const router = useRouter();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReservations = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        // GET /api/reservations filtra automáticamente por userId si no es admin
        const res = await fetch("/api/reservations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success !== false) {
          // json es el array o {success: true, data: array}
          const data = Array.isArray(json) ? json : json.data || [];
          setReservations(data);
        }
      } catch (error) {
        console.error("Error fetching reservations", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchMyReservations();
    }
  }, [userProfile, getToken]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const activas = reservations.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length;
  const completadas = reservations.filter(r => r.estado === 'pagada').length;
  // canceladas = reservations.filter(r => r.estado === 'cancelada').length;

  return (
    <ProtectedRoute requiredRole="cliente">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Perfil de Usuario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="h-16 w-16 bg-gray-200 text-gray-700 font-bold text-2xl flex items-center justify-center rounded-md">
              {userProfile?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userProfile?.nombre}</h1>
              <p className="text-gray-500">{userProfile?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Salir</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">{reservations.length}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">{activas}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Activas</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">{completadas}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Completadas</div>
          </div>
        </div>

        {/* Lista de Reservas */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Cargando tus reservas...</div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin reservas todavía</h3>
            <p className="text-gray-500 mb-6 max-w-md">Explora nuestras rutas y reserva tu próximo viaje.</p>
            <Link 
              href="/"
              className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Ver rutas disponibles
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {reservations.map((res: any) => (
                <li key={res.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {res.clienteNombre}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${res.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${res.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' : ''}
                          ${res.estado === 'pagada' ? 'bg-green-100 text-green-800' : ''}
                          ${res.estado === 'cancelada' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {res.estado.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Pasajeros: {res.pasajeros}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Total: <span className="font-medium text-gray-900">${res.precioTotal}</span></p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
