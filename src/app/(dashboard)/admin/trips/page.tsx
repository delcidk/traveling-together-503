"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { FormField } from "@/app/components/FormField";
import { useTripsContext } from "@/app/context/TripsContext";
import { useRoutesContext } from "@/app/context/RoutesContext";
import { useVehiclesContext } from "@/app/context/VehiclesContext";
import { TripSchema, Trip } from "@/lib/types";

type TripFormValues = z.infer<typeof TripSchema>;

export default function TripsAdminPage() {
  const { trips, loadingTrips, createTrip, updateTrip, deleteTrip } = useTripsContext();
  const { routes } = useRoutesContext();
  const { vehicles } = useVehiclesContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TripFormValues>({
    resolver: zodResolver(TripSchema) as any,
    defaultValues: {
      rutaId: "",
      vehiculoId: "",
      conductor: "",
      estado: "programado",
      asientosOcupados: 0,
      fechaSalida: new Date(),
    }
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    reset({
      rutaId: "",
      vehiculoId: "",
      conductor: "",
      estado: "programado",
      asientosOcupados: 0,
      fechaSalida: new Date(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trip: Trip) => {
    setEditingId(trip.id);
    reset({
      rutaId: trip.rutaId,
      vehiculoId: trip.vehiculoId,
      conductor: trip.conductor || "",
      estado: trip.estado,
      asientosOcupados: trip.asientosOcupados,
      fechaSalida: new Date(trip.fechaSalida),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateTrip(editingId, data);
        toast.success("Viaje actualizado correctamente");
      } else {
        await createTrip(data);
        toast.success("Viaje creado correctamente");
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el viaje");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este viaje? Las reservas asociadas podrían perder su referencia.")) {
      try {
        await deleteTrip(id);
        toast.success("Viaje eliminado");
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar");
      }
    }
  };

  const getRouteName = (id: string) => {
    const route = routes.find(r => r.id === id);
    return route ? `${route.origen} a ${route.destino}` : "Ruta desconocida";
  };

  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.nombre} (${v.capacidad} pax)` : "Vehículo desconocido";
  };

  const getVehicleCapacity = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.capacidad : 0;
  };

  const inputClass = (error?: any) => 
    `mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${error ? "border-red-300 bg-red-50" : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Viajes Programados</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Programar Nuevo Viaje
        </button>
      </div>

      {loadingTrips ? (
        <div className="text-center py-10">Cargando viajes...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Ruta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo / Conductor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay viajes programados.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => {
                  const cap = getVehicleCapacity(trip.vehiculoId);
                  const isFull = trip.asientosOcupados >= cap;
                  
                  return (
                    <tr key={trip.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {new Date(trip.fechaSalida).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getRouteName(trip.rutaId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getVehicleInfo(trip.vehiculoId)}</div>
                        <div className="text-sm text-gray-500">{trip.conductor || "Sin conductor asignado"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                            {trip.asientosOcupados} / {cap}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${trip.estado === 'programado' ? 'bg-blue-100 text-blue-800' : 
                            trip.estado === 'en_curso' ? 'bg-yellow-100 text-yellow-800' : 
                            trip.estado === 'finalizado' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {trip.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEdit(trip)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD Viaje */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" onClick={handleCloseModal}></div>

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editingId ? "Editar Viaje" : "Programar Nuevo Viaje"}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField label="Ruta / Destino" error={errors.rutaId?.message}>
                  <select {...register("rutaId")} className={inputClass(errors.rutaId)}>
                    <option value="">Selecciona la ruta...</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.origen} a {r.destino}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Fecha de Salida" error={errors.fechaSalida?.message}>
                  <input 
                    type="date" 
                    {...register("fechaSalida", { valueAsDate: true })} 
                    className={inputClass(errors.fechaSalida)} 
                  />
                </FormField>

                <FormField label="Vehículo Asignado" error={errors.vehiculoId?.message}>
                  <select {...register("vehiculoId")} className={inputClass(errors.vehiculoId)}>
                    <option value="">Selecciona el vehículo...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.nombre} (Cap: {v.capacidad})</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Nombre del Conductor" error={errors.conductor?.message}>
                  <input 
                    type="text" 
                    {...register("conductor")} 
                    className={inputClass(errors.conductor)} 
                    placeholder="Ej. Juan Pérez"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Estado" error={errors.estado?.message}>
                    <select {...register("estado")} className={inputClass(errors.estado)}>
                      <option value="programado">Programado</option>
                      <option value="en_curso">En Curso</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </FormField>
                  
                  <FormField label="Ocupación Manual" error={errors.asientosOcupados?.message}>
                    <input 
                      type="number" 
                      min="0"
                      {...register("asientosOcupados", { valueAsNumber: true })} 
                      className={inputClass(errors.asientosOcupados)} 
                    />
                  </FormField>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
