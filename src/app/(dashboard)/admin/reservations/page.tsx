"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useReservationContext } from "../../../context/ReservationContext";
import { useVehiclesContext } from "../../../context/VehiclesContext";
import { useRoutesContext } from "../../../context/RoutesContext";
import { toast } from "react-hot-toast";

export default function AdminReservationsPage() {
  const { reservations, loadingReservations, updateReservation, deleteReservation } = useReservationContext();
  const { vehicles } = useVehiclesContext();
  const { routes } = useRoutesContext();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateReservation(id, { estado: newStatus as any });
      toast.success("Estado actualizado");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al cambiar el estado.");
    }
  };

  const getVehicleName = (id: string) => {
    return vehicles.find(v => v.id === id)?.nombre || "Vehículo Desconocido";
  };

  const getRouteName = (id: string) => {
    const route = routes.find(r => r.id === id);
    return route ? `${route.origen} a ${route.destino}` : "Ruta Desconocida";
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
      case "confirmada":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Confirmada</span>;
      case "completada":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completada</span>;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservaciones</h1>
          <p className="mt-2 text-sm text-gray-700">Revisa y actualiza el estado de los viajes solicitados por los clientes.</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Viaje</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta & Vehículo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax / Precio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingReservations && reservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Cargando reservaciones...</td>
                    </tr>
                  ) : reservations.length > 0 ? (
                    reservations.map((res: any) => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {/* Handle date format properly checking if it's a firebase timestamp or JS date */}
                           {res.fechaViaje ? new Date(res.fechaViaje).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="font-semibold text-gray-900">{getRouteName(res.rutaId)}</div>
                          <div className="text-xs text-gray-400 mt-1">{getVehicleName(res.vehiculoId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {res.pasajeros} pax <br/>
                          <span className="font-medium text-gray-900">${res.precioTotal}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(res.estado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <select 
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={res.estado}
                            onChange={(e) => handleStatusChange(res.id, e.target.value)}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmar/Pagado</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelar</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No hay reservaciones registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
