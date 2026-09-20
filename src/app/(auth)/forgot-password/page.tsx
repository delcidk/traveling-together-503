"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { toast } from "react-hot-toast";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await resetPassword(data.email);
      setEmailSent(true);
      toast.success("Correo de recuperación enviado");
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err.message || "Error al enviar el correo de recuperación",
      });
      toast.error("Hubo un error al enviar el enlace");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">
        Recuperar Contraseña
      </h3>
      
      {emailSent ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-lg text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h4 className="text-lg font-bold mb-2">¡Revisa tu bandeja de entrada!</h4>
          <p className="text-sm">
            Te hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa también tu carpeta de spam o correo no deseado.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm text-gray-600 text-center mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para que puedas restablecer tu contraseña.
          </p>

          {errors.root && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {errors.root.message}
            </div>
          )}

          <FormField label="Correo electrónico" error={errors.email?.message}>
            <input
              type="email"
              {...register("email")}
              className={`appearance-none block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="ejemplo@correo.com"
            />
          </FormField>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Enviando enlace..." : "Enviar enlace de recuperación"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Cancelar y volver a Iniciar Sesión
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
