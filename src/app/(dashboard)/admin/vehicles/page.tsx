"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useVehiclesContext } from "../../../context/VehiclesContext";
import { Vehicle } from "@/lib/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../../components/FormField";
import { toast } from "react-hot-toast";

const VehicleFormSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  tipo: z.enum(["van", "microbus", "bus"]),
  capacidad: z.number().min(1, "La capacidad debe ser mayor a 0"),
  estado: z.enum(["disponible", "en_servicio", "mantenimiento"]),
  imagenUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

type VehicleFormValues = z.infer<typeof VehicleFormSchema>;

const INITIAL_FORM_DATA: VehicleFormValues = {
  nombre: "",
  tipo: "van",
  capacidad: 1,
  estado: "disponible",
  imagenUrl: "",
};

export default function VehiclesPage() {
  const { vehicles, loadingVehicles, createVehicle, updateVehicle, deleteVehicle } = useVehiclesContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(VehicleFormSchema),
    defaultValues: INITIAL_FORM_DATA,
    mode: "onBlur",
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    reset(INITIAL_FORM_DATA);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    reset({
      nombre: vehicle.nombre,
      tipo: vehicle.tipo as any,
      capacidad: vehicle.capacidad,
      estado: vehicle.estado as any,
      imagenUrl: vehicle.imagenUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      if (editingId) {
        await updateVehicle(editingId, data);
        toast.success("Vehículo actualizado correctamente");
      } else {
        await createVehicle(data);
        toast.success("Vehículo guardado correctamente");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error guardando vehículo:", error);
      toast.error("Hubo un error al guardar el vehículo.");
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el vehículo "${nombre}"?`)) {
      try {
        await deleteVehicle(id);
        toast.success("Vehículo eliminado");
      } catch (error) {
        console.error("Error eliminando vehículo:", error);
        toast.error("Hubo un error al eliminar el vehículo.");
      }
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>;
      case "en_servicio":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">En Servicio</span>;
      case "mantenimiento":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Mantenimiento</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  const inputClass = (error?: object) => 
    `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
      error ? "border-red-300 bg-red-50" : "border-gray-300"
    }`;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Flota</h1>
          <p className="mt-2 text-sm text-gray-700">Lista completa de vehículos disponibles en la agencia.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Agregar Vehículo
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingVehicles && (!vehicles || vehicles.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Cargando flota...</td>
                    </tr>
                  ) : vehicles && vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {vehicle.imagenUrl ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={vehicle.imagenUrl} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vehicle.nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{vehicle.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.capacidad} pax</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(vehicle.estado)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleOpenEdit(vehicle)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                          <button onClick={() => handleDelete(vehicle.id, vehicle.nombre)} className="text-red-600 hover:text-red-900">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No hay vehículos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {editingId ? "Editar Vehículo" : "Nuevo Vehículo"}
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField label="Nombre del vehículo" error={errors.nombre?.message}>
                      <input type="text" {...register("nombre")} className={inputClass(errors.nombre)} />
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Tipo" error={errors.tipo?.message}>
                        <select {...register("tipo")} className={`bg-white ${inputClass(errors.tipo)}`}>
                          <option value="van">Van</option>
                          <option value="microbus">Microbús</option>
                          <option value="bus">Autobús</option>
                        </select>
                      </FormField>

                      <FormField label="Capacidad (pasajeros)" error={errors.capacidad?.message}>
                        <input type="number" min="1" {...register("capacidad", { valueAsNumber: true })} className={inputClass(errors.capacidad)} />
                      </FormField>
                    </div>

                    <FormField label="Estado Operativo" error={errors.estado?.message}>
                      <select {...register("estado")} className={`bg-white ${inputClass(errors.estado)}`}>
                        <option value="disponible">Disponible</option>
                        <option value="en_servicio">En Servicio</option>
                        <option value="mantenimiento">En Mantenimiento</option>
                      </select>
                    </FormField>

                    <FormField label="URL de Imagen (Opcional)" error={errors.imagenUrl?.message}>
                      <input type="url" placeholder="https://..." {...register("imagenUrl")} className={inputClass(errors.imagenUrl)} />
                    </FormField>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
