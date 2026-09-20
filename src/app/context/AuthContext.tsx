"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "firebase/auth";
import { User as UserProfile } from "@/lib/types";
import { useAuthLogic } from "../hooks/useAuthLogic";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, nombre: string, telefono?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthLogic();

  return (
    <AuthContext.Provider value={authState}>
      {authState.loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
           <p className="text-gray-600">Cargando...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};