"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "cliente";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (requiredRole && userProfile && userProfile.rol !== requiredRole) {
        // Redirigir si no tiene el rol necesario
        router.push("/");
      }
    }
  }, [user, userProfile, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
         <p className="text-gray-600">Verificando permisos...</p>
      </div>
    );
  }

  // Si no hay usuario, o falta el rol, no renderizamos los children
  // (el useEffect ya disparó la redirección, pero evitamos flashes de contenido).
  if (!user || (requiredRole && userProfile?.rol !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
