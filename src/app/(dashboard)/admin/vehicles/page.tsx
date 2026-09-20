"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useVehiclesContext } from "../../../context/VehiclesContext";
import { Vehicle } from "@/lib/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../../components/FormField";
import { ImageUpload } from "../../../components/ImageUpload";
import { MultiImageUpload } from "../../../components/MultiImageUpload";
import { toast } from "react-hot-toast";

const VehicleFormSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  tipo: z.enum(["van", "microbus", "bus"]),
  capacidad: z.number().min(1, "La capacidad debe ser mayor a 0"),
  estado: z.enum(["disponible", "en_servicio", "mantenimiento"]),
  imagenUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  galeria: z.array(z.string()).optional(),
});

type VehicleFormValues = z.infer<typeof VehicleFormSchema>;

const INITIAL_FORM_DATA: VehicleFormValues = {
  nombre: "",
  tipo: "van",
  capacidad: 1,
  estado: "disponible",
  imagenUrl: "",
  galeria: [],
};

export default function VehiclesPage() {
  const { vehicles, loadingVehicles, createVehicle, updateVehicle, deleteVehicle } = useVehiclesContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      galeria: vehicle.galeria || [],
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
    `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white ${
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
        <div className="fixed z-50 inset-0 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}>
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', color: '#111827' }} // Forzando colores anti-dark mode
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
              <div className="px-6 pt-6 pb-4 overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2" id="modal-title">
                  {editingId ? "Editar Vehículo" : "Nuevo Vehículo"}
                </h3>
                
                <div className="space-y-5">
                  <FormField label="Modelo y Año del vehículo" error={errors.nombre?.message}>
                    <input type="text" {...register("nombre")} className={inputClass(errors.nombre)} placeholder="Ej. Toyota Hiace 2024" />
                  </FormField>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <FormField label="Tipo de Vehículo" error={errors.tipo?.message}>
                      <select {...register("tipo")} className={`bg-white ${inputClass(errors.tipo)}`}>
                        <option value="van">Van (Minivan)</option>
                        <option value="microbus">Microbús (15-20 pax)</option>
                        <option value="bus">Autobús (30+ pax)</option>
                      </select>
                    </FormField>

                    <FormField label="Capacidad (pasajeros)" error={errors.capacidad?.message}>
                      <input type="number" min="1" placeholder="Ej. 15" {...register("capacidad", { valueAsNumber: true })} className={inputClass(errors.capacidad)} />
                    </FormField>
                  </div>

                  <FormField label="Estado Operativo actual" error={errors.estado?.message}>
                    <select {...register("estado")} className={`bg-white ${inputClass(errors.estado)}`}>
                      <option value="disponible">🟢 Disponible para viajes</option>
                      <option value="en_servicio">🔵 En Servicio (Ocupado)</option>
                      <option value="mantenimiento">🔴 En Mantenimiento</option>
                    </select>
                  </FormField>

                  <FormField label="Fotografía Principal (Portada)" error={errors.imagenUrl?.message}>
                    <ImageUpload 
                      value={watch("imagenUrl")} 
                      onChange={(url) => setValue("imagenUrl", url, { shouldValidate: true, shouldDirty: true })} 
                    />
                  </FormField>

                  <FormField label="Galería de Fotos Adicionales" error={errors.galeria?.message}>
                    <MultiImageUpload 
                      value={watch("galeria")} 
                      onChange={(urls) => setValue("galeria", urls, { shouldValidate: true, shouldDirty: true })} 
                    />
                  </FormField>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-row-reverse rounded-b-2xl" style={{ backgroundColor: '#f9fafb' }}>
                <button type="submit" disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
