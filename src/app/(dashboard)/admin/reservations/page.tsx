"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useReservationContext } from "../../../context/ReservationContext";
import { useTripsContext } from "../../../context/TripsContext";
import { useRoutesContext } from "../../../context/RoutesContext";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/AuthContext";

export default function AdminReservationsPage() {
  const { reservations, loadingReservations, createReservation, updateReservation, deleteReservation } = useReservationContext();
  const { trips } = useTripsContext();
  const { routes } = useRoutesContext();
  const { getToken } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      viajeId: "",
      userId: "",
      clienteNombre: "",
      clienteTelefono: "",
      pasajeros: 1,
      precioTotal: "" as unknown as number,
      estado: "pendiente"
    }
  });

  const watchViajeId = watch("viajeId");
  const watchPasajeros = watch("pasajeros");

  const handleOpenCreate = () => {
    setEditingId(null);
    reset({
      viajeId: "",
      userId: "",
      clienteNombre: "",
      clienteTelefono: "",
      pasajeros: 1,
      precioTotal: "" as unknown as number,
      estado: "pendiente"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: any) => {
    setEditingId(res.id);
    reset({
      viajeId: res.viajeId,
      userId: res.userId || "",
      clienteNombre: res.clienteNombre,
      clienteTelefono: res.clienteTelefono || "",
      pasajeros: res.pasajeros,
      precioTotal: res.precioTotal,
      estado: res.estado
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateReservation(id, { estado: newStatus as any });
      toast.success("Estado actualizado");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
      try {
        await deleteReservation(id);
        toast.success("Reserva eliminada");
      } catch(e: any) {
        toast.error(e.message || "Error al eliminar");
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateReservation(editingId, data);
        toast.success("Reserva actualizada correctamente");
      } else {
        await createReservation(data);
        toast.success("Reserva creada correctamente");
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la reserva");
    }
  };

  const getTripLabel = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return "Viaje desconocido";
    const route = routes.find(r => r.id === trip.rutaId);
    return `${new Date(trip.fechaSalida).toLocaleDateString()} - ${route ? route.origen + ' a ' + route.destino : 'Ruta'} (${trip.asientosOcupados} ocupados)`;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
      case "confirmada":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Confirmada</span>;
      case "pagada":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pagada</span>;
      case "cancelada":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelada</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservaciones</h1>
          <p className="mt-2 text-sm text-gray-700">Gestiona los pasajeros dentro de los viajes programados.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Agregar Reserva Manual
        </button>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viaje (Fecha / Ruta)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasajeros</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingReservations && reservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Cargando reservaciones...</td>
                    </tr>
                  ) : reservations.length > 0 ? (
                    reservations.map((res: any) => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="font-semibold text-gray-900">{getTripLabel(res.viajeId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {res.clienteNombre}
                          <div className="text-xs text-gray-500">{res.clienteTelefono}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {res.pasajeros} pax
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          ${res.precioTotal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(res.estado)}
                          <select 
                            className="mt-2 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={res.estado}
                            onChange={(e) => handleStatusChange(res.id, e.target.value)}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="pagada">Pagada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenEdit(res)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No hay reservaciones registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editingId ? "Editar Reserva" : "Agregar Reserva Manual"}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Viaje Programado</label>
                  <select {...register("viajeId")} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white" required>
                    <option value="">Selecciona el viaje...</option>
                    {trips.filter(t => t.estado !== 'cancelado').map(t => (
                      <option key={t.id} value={t.id}>{getTripLabel(t.id)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Asociar a un usuario (Opcional)</label>
                  <select {...register("userId")} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white">
                    <option value="">(Ninguno - Reserva como Invitado)</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>{u.nombre} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                  <input type="text" {...register("clienteNombre")} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    {...register("clienteTelefono")} 
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white" 
                    onKeyDown={(e) => {
                      if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '+', ' ', '-'].includes(e.key)) return;
                      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                      if (e.key < '0' || e.key > '9') {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pasajeros</label>
                    <input type="number" min="1" {...register("pasajeros", { valueAsNumber: true })} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cobro Total ($)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      {...register("precioTotal", { valueAsNumber: true })} 
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white" 
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                          return;
                        }
                        const target = e.target as HTMLInputElement;
                        const val = target.value;
                        if (val.includes('.') && e.key >= '0' && e.key <= '9') {
                          const decimals = val.split('.')[1];
                          if (decimals && decimals.length >= 2) {
                            if (target.selectionStart !== null && target.selectionStart > val.indexOf('.')) {
                              if (target.selectionStart === target.selectionEnd) {
                                e.preventDefault();
                              }
                            }
                          }
                        }
                      }}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de la Reserva</label>
                  <select {...register("estado")} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white">
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="pagada">Pagada</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md">Guardar Reserva</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
