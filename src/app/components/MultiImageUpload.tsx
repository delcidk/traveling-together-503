"use client";

import React, { useState, useRef } from "react";
import { uploadImageToImgBB } from "@/lib/imgbb-helpers";

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
}

export function MultiImageUpload({ value = [], onChange }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      // Subir las imágenes en paralelo
      const uploadPromises = files.map(file => uploadImageToImgBB(file));
      const results = await Promise.all(uploadPromises);
      
      // Agregar las nuevas URLs al arreglo existente
      onChange([...value, ...results]);
    } catch (err: any) {
      setError(err.message || "Error subiendo algunas imágenes");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Limpiar input para permitir subir la misma foto otra vez si se desea
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square group shadow-sm">
            <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transform hover:scale-110 transition-transform"
                title="Eliminar foto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Botón de agregar más fotos */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-2 aspect-square bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-6 w-6 text-blue-600 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-[10px] font-medium text-gray-700">Subiendo...</span>
            </div>
          ) : (
            <>
              <svg className="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs font-medium text-blue-600 text-center leading-tight">Agregar<br/>fotos</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600 animate-pulse">{error}</p>}
    </div>
  );
}
