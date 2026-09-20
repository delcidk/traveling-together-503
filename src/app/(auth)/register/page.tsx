"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";

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
  const { register: registerAuth } = useAuth();
  const router = useRouter();
  
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
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </div>
      </form>

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
