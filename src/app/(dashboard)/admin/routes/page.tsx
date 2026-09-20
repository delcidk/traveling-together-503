"use client";

import { useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useRoutesContext } from "../../../context/RoutesContext";
import { Route, CreateRouteSchema } from "@/lib/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../../components/FormField";
import { ImageUpload } from "../../../components/ImageUpload";
import { MultiImageUpload } from "../../../components/MultiImageUpload";
import { toast } from "react-hot-toast";

const RouteFormSchema = z.object({
  origen: z.string().min(1, "El origen es obligatorio"),
  destino: z.string().min(1, "El destino es obligatorio"),
  distanciaKm: z.number().positive("La distancia debe ser mayor a 0"),
  tarifaBase: z.number().nonnegative("La tarifa no puede ser negativa"),
  descripcion: z.string().optional(),
  imagenUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  galeria: z.array(z.string()).optional(),
  activa: z.boolean(),
});

type RouteFormValues = z.infer<typeof RouteFormSchema>;

const INITIAL_FORM_DATA: RouteFormValues = {
  origen: "",
  destino: "",
  distanciaKm: 1,
  tarifaBase: 0,
  descripcion: "",
  imagenUrl: "",
  galeria: [],
  activa: true,
};

export default function RoutesPage() {
  const { routes, loadingRoutes, createRoute, updateRoute, deleteRoute } = useRoutesContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(RouteFormSchema),
    defaultValues: INITIAL_FORM_DATA,
    mode: "onBlur",
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    reset(INITIAL_FORM_DATA);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: Route) => {
    setEditingId(route.id);
    reset({
      origen: route.origen,
      destino: route.destino,
      distanciaKm: route.distanciaKm,
      tarifaBase: route.tarifaBase,
      descripcion: route.descripcion || "",
      imagenUrl: route.imagenUrl || "",
      galeria: route.galeria || [],
      activa: route.activa,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: RouteFormValues) => {
    try {
      if (editingId) {
        await updateRoute(editingId, data);
        toast.success("Ruta actualizada correctamente");
      } else {
        await createRoute(data);
        toast.success("Ruta creada correctamente");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error guardando ruta:", error);
      toast.error("Hubo un error al guardar la ruta.");
    }
  };

  const handleDelete = async (id: string, destino: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la ruta hacia "${destino}"?`)) {
      try {
        await deleteRoute(id);
        toast.success("Ruta eliminada");
      } catch (error) {
        console.error("Error eliminando ruta:", error);
        toast.error("Hubo un error al eliminar la ruta.");
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Rutas y Tours</h1>
          <p className="mt-2 text-sm text-gray-700">Administra los destinos, precios e información disponible para los clientes.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Agregar Ruta
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino / Origen</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifa Base</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distancia</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingRoutes && (!routes || routes.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Cargando rutas...</td>
                    </tr>
                  ) : routes && routes.length > 0 ? (
                    routes.map((route) => (
                      <tr key={route.id} className={`hover:bg-gray-50 transition-colors ${!route.activa && 'opacity-60'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {route.imagenUrl ? (
                              <img className="h-10 w-10 rounded object-cover" src={route.imagenUrl} alt={route.destino} />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{route.destino}</div>
                              <div className="text-sm text-gray-500">Desde: {route.origen}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${route.tarifaBase.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.distanciaKm} km</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {route.activa ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activa</span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactiva</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleOpenEdit(route)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                          <button onClick={() => handleDelete(route.id, route.destino)} className="text-red-600 hover:text-red-900">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No hay rutas registradas.</td>
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
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
              <div className="px-6 pt-6 pb-4 overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2" id="modal-title">
                  {editingId ? "Editar Ruta" : "Nueva Ruta"}
                </h3>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField label="Ciudad de Origen" error={errors.origen?.message}>
                      <input type="text" {...register("origen")} className={inputClass(errors.origen)} placeholder="Ej. San Salvador" />
                    </FormField>

                    <FormField label="Lugar de Destino" error={errors.destino?.message}>
                      <input type="text" {...register("destino")} className={inputClass(errors.destino)} placeholder="Ej. El Tunco, La Libertad" />
                    </FormField>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <FormField label="Tarifa Base ($)" error={errors.tarifaBase?.message}>
                      <input type="number" step="0.01" min="0" placeholder="Ej. 45.00" {...register("tarifaBase", { valueAsNumber: true })} className={inputClass(errors.tarifaBase)} />
                    </FormField>

                    <FormField label="Distancia estimada (Km)" error={errors.distanciaKm?.message}>
                      <input type="number" step="0.1" min="0.1" placeholder="Ej. 40.5" {...register("distanciaKm", { valueAsNumber: true })} className={inputClass(errors.distanciaKm)} />
                    </FormField>
                  </div>

                  <FormField label="Descripción / Recomendaciones" error={errors.descripcion?.message}>
                    <textarea 
                      {...register("descripcion")} 
                      className={`${inputClass(errors.descripcion)} resize-none h-24`} 
                      placeholder="Ej: Tour de 6 horas. Incluye paradas en miradores..." 
                    />
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

                  <div className="flex items-center mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md" style={{ backgroundColor: '#eff6ff', borderColor: '#dbeafe' }}>
                    <input 
                      type="checkbox" 
                      {...register("activa")} 
                      id="activa" 
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="activa" className="ml-3 block text-sm text-gray-900 font-semibold cursor-pointer">
                      Ruta Activa (Visible)
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-row-reverse rounded-b-2xl" style={{ backgroundColor: '#f9fafb' }}>
                <button type="submit" disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Ruta"}
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
