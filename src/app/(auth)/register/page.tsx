"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { isAuthCancelledError } from "@/lib/auth-errors";

const RegisterSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Ingresa un correo válido"),
  telefono: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const { register: registerAuth, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerAuth(data.email, data.password, data.nombre, data.telefono);
      router.push("/");
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err.message || "Error al crear la cuenta",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      router.push("/");
    } catch (err: any) {
      if (isAuthCancelledError(err)) return;
      setError("root", {
        type: "manual",
        message: err?.message || "Error al registrarse con Google",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass = (error?: object) => 
    `mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400 ${
      error ? "border-red-300" : "border-gray-300"
    }`;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">Crear una cuenta nueva</h3>
      
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
            {errors.root.message}
          </div>
        )}

        <FormField label="Nombre completo" error={errors.nombre?.message}>
          <input
            type="text"
            {...register("nombre")}
            className={inputClass(errors.nombre)}
          />
        </FormField>

        <FormField label="Correo electrónico" error={errors.email?.message}>
          <input
            type="email"
            {...register("email")}
            className={inputClass(errors.email)}
          />
        </FormField>

        <FormField label="Teléfono (opcional)" error={errors.telefono?.message}>
          <input
            type="tel"
            {...register("telefono")}
            className={inputClass(errors.telefono)}
          />
        </FormField>

        <FormField label="Contraseña" error={errors.password?.message}>
          <input
            type="password"
            {...register("password")}
            className={inputClass(errors.password)}
          />
        </FormField>

        <FormField label="Confirmar Contraseña" error={errors.confirmPassword?.message}>
          <input
            type="password"
            {...register("confirmPassword")}
            className={inputClass(errors.confirmPassword)}
          />
        </FormField>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || googleLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o regístrate con</span>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? "Conectando con Google..." : "Continuar con Google"}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
