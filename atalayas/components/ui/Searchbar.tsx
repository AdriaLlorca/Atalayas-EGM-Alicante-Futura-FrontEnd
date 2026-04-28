'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Al expandir, ponemos el foco automáticamente
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className="relative flex items-center justify-end h-12">
      <div 
        className={`
          flex items-center transition-all duration-500 ease-in-out overflow-hidden
          ${isExpanded 
            ? 'w-full max-w-md bg-white border border-gray-200 shadow-sm px-4' 
            : 'w-12 bg-transparent border border-transparent'}
          rounded-2xl h-full
        `}
      >
        {/* Icono de Lupa / Botón de activación */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center justify-center shrink-0 transition-colors
            ${isExpanded ? 'text-[#0071e3]' : 'text-gray-500 hover:text-[#1d1d1f] w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm'}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Input Desplegable */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => { if (!value) setIsExpanded(false); }} // Se cierra si está vacío al perder el foco
          placeholder={placeholder}
          className={`
            ml-3 w-full bg-transparent text-sm text-[#1d1d1f] outline-none placeholder:text-[#86868b] transition-opacity duration-300
            ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        />

        {/* Botón Cerrar (X) */}
        {isExpanded && value && (
          <button 
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
    </div>
  );
}