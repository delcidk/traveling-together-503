"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useRoutesContext } from "@/app/context/RoutesContext";

export default function DestinoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const { routes, loadingRoutes } = useRoutesContext();

  const [pasajeros, setPasajeros] = useState(1);
  const [fecha, setFecha] = useState('');

  const route = routes.find(r => r.id === id);

  const handleWhatsAppRedirect = () => {
    if (!fecha) {
      alert("Por favor selecciona una fecha de viaje para cotizar.");
      return;
    }
    const precioTotal = (route!.tarifaBase * pasajeros).toFixed(2);
    const mensaje = `Hola, me gustaría cotizar un viaje privado:\n\n📍 *Ruta:* ${route!.origen} ➔ ${route!.destino}\n👥 *Pasajeros:* ${pasajeros}\n📅 *Fecha:* ${fecha}\n💵 *Cotización estimada:* $${precioTotal} USD\n\n¿Tienen disponibilidad para esta fecha?`;
    
    const url = `https://wa.me/50369557127?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (loadingRoutes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Destino no encontrado</h1>
        <Link href="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  // Estimación de duración (60km/h)
  const durationHours = Math.max(1, Math.ceil(route.distanciaKm / 60));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar (Similar a Home) */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-900 tracking-tight">
                <span className="bg-gray-900 text-white p-1 rounded mr-2 inline-flex items-center justify-center w-6 h-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </span>
                TRAVELING TOGETHER <span className="text-blue-400 ml-1">503</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/#tours" className="text-gray-500 hover:text-gray-900 font-medium">Servicios</Link>
              <Link href="/#contact" className="text-gray-500 hover:text-gray-900 font-medium">Contacto</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button onClick={() => logout()} className="text-sm font-medium text-gray-700 hover:text-red-600 border border-gray-300 px-4 py-2 rounded">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded">
                  Iniciar sesión
                </Link>
              )}
              <a href="https://wa.me/c/50369557127" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded bg-green-500 text-sm font-medium text-white hover:bg-green-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column - Main Image */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video relative flex items-center justify-center">
              {route.imagenUrl ? (
                <img src={route.imagenUrl} alt={route.destino} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Foto principal de la ruta</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-1/2 w-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 font-medium bg-white shadow-sm">Destino</span>
              <span className="text-sm text-gray-400 font-medium">ID: {route.id.substring(0, 8)}...</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
              {route.origen} ➔ {route.destino}
            </h1>
            
            <p className="text-gray-500 text-lg mb-6 font-medium">
              Viaje privado: {route.origen}, El Salvador ➔ {route.destino}
            </p>

            <p className="text-gray-700 text-base mb-8 leading-relaxed">
              {route.descripcion || "Viaje directo y privado con todo el confort que mereces. Nuestra flota moderna garantiza que llegues a tu destino de la mejor manera."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Duración aprox.</span>
                <span className="text-gray-900 font-bold text-lg">{durationHours} - {durationHours + 1} hrs</span>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Distancia</span>
                <span className="text-gray-900 font-bold text-lg">{route.distanciaKm} km</span>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Precio desde</span>
                <span className="text-gray-900 font-bold text-lg">${route.tarifaBase.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">INCLUYE</span>
              <div className="flex flex-wrap gap-2">
                {["A/C", "WiFi (en unidades selectas)", "Agua incluida", "Paradas de descanso"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 bg-gray-50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-auto shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cotiza tu viaje privado</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pasajeros</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={pasajeros} 
                    onChange={(e) => setPasajeros(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-5">
                <span className="text-gray-600 font-medium">Cotización total:</span>
                <span className="text-2xl font-extrabold text-blue-600">${(route.tarifaBase * pasajeros).toFixed(2)} USD</span>
              </div>

              <button 
                onClick={handleWhatsAppRedirect}
                className="w-full bg-green-500 text-white text-center py-3.5 rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Enviar cotización por WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mt-16 border-t border-gray-100 pt-16 mb-20">
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">Galería de fotos</h3>
          
          {route.galeria && route.galeria.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {route.galeria.map((url, idx) => (
                <div key={idx} className="bg-gray-100 rounded-lg overflow-hidden aspect-[4/3] relative hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                  <img src={url} alt={`Galería ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 py-10 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <p>No hay fotos en la galería de este destino</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; 2026 Traveling Together 503. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
