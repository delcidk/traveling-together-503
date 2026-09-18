import React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
