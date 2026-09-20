"use client";

import React, { useState, useRef } from "react";
import { uploadImageToImgBB } from "@/lib/imgbb-helpers";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImageToImgBB(file);
      onChange(url); // Actualizar el formulario con la URL recibida
    } catch (err: any) {
      setError(err.message || "Error subiendo la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-300 w-full h-40 bg-gray-50 flex items-center justify-center group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-gray-900 px-3 py-1.5 rounded-md font-medium text-sm shadow-sm hover:bg-gray-100"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md font-medium text-sm shadow-sm hover:bg-red-700"
            >
              Borrar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">Subiendo a ImgBB...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-600">Haz clic para subir una foto</span>
              <span className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (Máx. 32MB)</span>
            </div>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 animate-pulse">{error}</p>
      )}
    </div>
  );
}
