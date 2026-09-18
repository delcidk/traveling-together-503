"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useVehiclesContext } from "./context/VehiclesContext";
import { useRoutesContext } from "./context/RoutesContext";
import { useReservationContext } from "./context/ReservationContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./components/FormField";
import { toast } from "react-hot-toast";

const QuotationSchema = z.object({
  rutaId: z.string().min(1, "Selecciona un destino"),
  vehiculoId: z.string().min(1, "Selecciona un vehículo"),
  pasajeros: z.number().min(1, "Debe haber al menos 1 pasajero"),
  fechaViaje: z.string().refine((dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, { message: "La fecha debe ser igual o posterior a hoy" })
});

type QuotationFormValues = z.infer<typeof QuotationSchema>;

export default function Home() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  // Contextos
  const { vehicles, loadingVehicles } = useVehiclesContext();
  const { routes, loadingRoutes } = useRoutesContext();
  const { draft, setDraft, submitReservation, creatingReservation } = useReservationContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(QuotationSchema),
    defaultValues: {
      rutaId: draft.rutaId || "",
      vehiculoId: draft.vehiculoId || "",
      pasajeros: draft.pasajeros || 1,
      fechaViaje: draft.fechaViaje ? new Date(draft.fechaViaje).toISOString().split('T')[0] : "",
    },
    mode: "onBlur",
  });

  const watchRutaId = watch("rutaId");
  const watchVehiculoId = watch("vehiculoId");
  const watchPasajeros = watch("pasajeros");
  const watchFechaViaje = watch("fechaViaje");

  // Efecto para actualizar el draft centralizado (y calcular precio) en tiempo real
  useEffect(() => {
    let newDraft = { ...draft };
    let priceCalculated = 0;

    const selectedRoute = routes.find(r => r.id === watchRutaId);
    if (selectedRoute) {
      newDraft.origen = selectedRoute.origen;
      newDraft.destino = selectedRoute.destino;
      priceCalculated = selectedRoute.tarifaBase;
    }

    newDraft.rutaId = watchRutaId;
    newDraft.vehiculoId = watchVehiculoId;
    newDraft.pasajeros = watchPasajeros;
    if (watchFechaViaje) {
      newDraft.fechaViaje = new Date(watchFechaViaje);
    }
    newDraft.precioTotal = priceCalculated;

    setDraft(newDraft);
  }, [watchRutaId, watchVehiculoId, watchPasajeros, watchFechaViaje, routes]);

  const onSubmit = async (data: QuotationFormValues) => {
    if (!user) {
      // Si no está logueado, lo mandamos a login. (El contexto guarda el borrador actualizado).
      router.push("/login");
      return;
    }

    try {
      await submitReservation();
      toast.success("¡Tu solicitud de reservación ha sido enviada con éxito!");
      router.push("/admin/reservations"); // O dashboard cliente cuando exista
    } catch (error: any) {
      toast.error("Error al reservar: " + error.message);
    }
  };

  const inputClass = (error?: object) => 
    `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
      error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Traveling Together 503
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="#tours" className="text-gray-500 hover:text-gray-900 font-medium">Destinos</Link>
              <Link href="#about" className="text-gray-500 hover:text-gray-900 font-medium">Nosotros</Link>
              <Link href="#contact" className="text-gray-500 hover:text-gray-900 font-medium">Contacto</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Hola, {userProfile?.nombre || "Usuario"}
                  </span>
                  {userProfile?.rol === "admin" && (
                     <Link href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                       Panel Admin
                     </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative bg-blue-900">
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-blue-800 to-blue-600 mix-blend-multiply" />
          </div>
          <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
            
            <div className="lg:w-1/2 lg:pr-8 text-center lg:text-left mb-12 lg:mb-0">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Descubre El Salvador a tu medida
              </h1>
              <p className="mt-6 text-xl text-blue-100 max-w-3xl">
                Cotiza tu transporte privado, elige tu destino y viaja cómodo y seguro con nuestra flota premium.
              </p>
            </div>

            <div className="lg:w-1/2 w-full max-w-md mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-4 relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">Cotiza tu Viaje</h3>
                
                <FormField label="Destino" error={errors.rutaId?.message}>
                  <select {...register("rutaId")} className={inputClass(errors.rutaId)}>
                    <option value="" disabled>Selecciona una ruta...</option>
                    {routes.filter((r:any) => r.activa).map((route: any) => (
                      <option key={route.id} value={route.id}>
                        {route.origen} a {route.destino} (Base: ${route.tarifaBase})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Vehículo" error={errors.vehiculoId?.message}>
                  <select {...register("vehiculoId")} className={inputClass(errors.vehiculoId)}>
                    <option value="" disabled>Selecciona la unidad...</option>
                    {vehicles.filter((v:any) => v.estado === "disponible").map((vehicle: any) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.nombre} (Capacidad: {vehicle.capacidad} pax)
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Pasajeros" error={errors.pasajeros?.message}>
                    <input type="number" min="1" {...register("pasajeros", { valueAsNumber: true })} className={inputClass(errors.pasajeros)} />
                  </FormField>
                  <FormField label="Fecha" error={errors.fechaViaje?.message}>
                    <input type="date" {...register("fechaViaje")} className={inputClass(errors.fechaViaje)} />
                  </FormField>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-medium text-gray-700">Precio Total:</span>
                    <span className="text-3xl font-extrabold text-blue-600">
                      ${draft.precioTotal || "0.00"}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={creatingReservation || loadingRoutes || loadingVehicles}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                  >
                    {creatingReservation ? "Procesando..." : (user ? "Confirmar Reserva" : "Inicia Sesión para Reservar")}
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        </div>

        <div id="tours" className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Nuestros Destinos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1, 2, 3].map((item) => (
               <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                 <div className="h-48 bg-gray-200 w-full animate-pulse"></div>
                 <div className="p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Destino {item}</h3>
                   <p className="text-gray-600 text-sm mb-4">Descripción corta del destino turístico.</p>
                   <button className="w-full bg-blue-50 text-blue-700 font-medium py-2 rounded border border-blue-100 hover:bg-blue-100 transition">
                     Ver detalles
                   </button>
                 </div>
               </div>
             ))}
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
