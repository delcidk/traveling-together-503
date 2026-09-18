"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { UsersProvider } from "../context/UsersContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <UsersProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Top Navbar */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                      TT503
                    </Link>
                  </div>
                  <nav className="ml-6 flex space-x-8">
                    <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Inicio
                    </Link>
                    {userProfile?.rol === "admin" && (
                      <>
                        <Link href="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                          Dashboard
                        </Link>
                        <Link href="/admin/vehicles" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                          Flota
                        </Link>
                        <Link href="/admin/reservations" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                          Reservaciones
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-4">
                    Hola, {userProfile?.nombre}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </UsersProvider>
    </ProtectedRoute>
  );
}
