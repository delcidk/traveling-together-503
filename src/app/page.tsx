"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useRoutesContext } from "./context/RoutesContext";

export default function Home() {
  const { user, userProfile, logout } = useAuth();
  const { routes, loadingRoutes } = useRoutesContext();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
                <span className="bg-gray-900 text-white p-1 rounded mr-2 inline-flex items-center justify-center w-6 h-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </span>
                TRAVELING TOGETHER <span className="text-gray-500 ml-1">503</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link href="#tours" className="text-gray-500 hover:text-gray-900 font-medium">Servicios</Link>
              <Link href="#contact" className="text-gray-500 hover:text-gray-900 font-medium">Contacto</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Hola, {userProfile?.nombre || "Usuario"}
                  </span>
                  {userProfile?.rol === "admin" ? (
                    <Link href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Panel Admin
                    </Link>
                  ) : (
                    <Link href="/mis-reservas" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Mis Reservas
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-gray-700 hover:text-red-600 border border-gray-300 px-4 py-1.5 rounded"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 px-4 py-1.5 rounded">
                    Iniciar sesión
                  </Link>
                </>
              )}
              <a href="https://wa.me/c/50369557127" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-1.5 border border-transparent rounded bg-green-500 text-sm font-medium text-white hover:bg-green-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">

            {/* Contenido Izquierdo */}
            <div className="lg:w-1/2 w-full text-center lg:text-left">
              {/* Badge */}
              <div className="inline-block border border-gray-300 rounded px-3 py-1 mb-8 text-xs font-semibold text-gray-500 tracking-widest uppercase">
                El Salvador • Guatemala • Nicaragua
              </div>

              {/* Titulo */}
              <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold text-gray-900 tracking-tighter leading-[0.9] mb-1 uppercase">
                TRAVELING <br /> TOGETHER
              </h1>
              <h2 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold text-gray-400 tracking-tighter leading-none mb-8">
                503
              </h2>

              {/* Descripción */}
              <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
                Transporte privado para turistas y viajeros en Centroamérica. Cómodo, seguro y con atención personalizada en cada ruta.
              </p>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link href="#tours" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors">
                  Ver todos los servicios ↗
                </Link>
                <a href="https://wa.me/c/50369557127" target="_blank" rel="noreferrer" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-sm font-bold rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  Cotizar por WhatsApp
                </a>
              </div>

              {/* Divisor */}
              <div className="w-full h-px bg-gray-200 mb-8 max-w-xl mx-auto lg:mx-0"></div>

              {/* Estadísticas */}
              <div className="flex justify-center lg:justify-start gap-12">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">10+</p>
                  <p className="text-sm font-medium text-gray-500">Rutas activas</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">500+</p>
                  <p className="text-sm font-medium text-gray-500">Viajeros felices</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">24/7</p>
                  <p className="text-sm font-medium text-gray-500">Atención directa</p>
                </div>
              </div>
            </div>

            {/* Contenido Derecho */}
            <div className="lg:w-1/2 w-full">
              <div className="rounded-lg overflow-hidden aspect-[4/3] relative shadow-2xl border border-gray-100">
                <img 
                  src="/images/hero-landscape.jpg" 
                  alt="Paisaje de Centroamérica" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECCION DE LA CUADRICULA DE RUTAS */}
        <div id="tours" className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Nuestros Destinos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingRoutes ? (

              [1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="h-48 bg-gray-200 w-full animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
                    <div className="w-full bg-gray-100 h-10 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : routes.filter(r => r.activa).length > 0 ? (

              routes.filter(r => r.activa).slice(0, 6).map((route: any) => (
                <div key={route.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                  {route.imagenUrl ? (
                    <img src={route.imagenUrl} alt={route.destino} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 bg-gray-200 w-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {route.origen} a {route.destino}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {route.descripcion || "Viaje directo y cómodo con todo el confort que mereces."}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-500">{route.distanciaKm} km</span>
                      <span className="text-sm font-bold text-gray-900">Desde ${route.tarifaBase.toFixed(2)}</span>
                    </div>

                    <Link
                      href={`/destinos/${route.id}`}
                      className="w-full text-center block bg-blue-50 text-blue-700 font-medium py-2 rounded border border-blue-100 hover:bg-blue-100 transition mt-auto"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-500">
                No hay destinos disponibles en este momento.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; 2026 Traveling Together 503. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
