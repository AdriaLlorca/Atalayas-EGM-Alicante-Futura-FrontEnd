'use client';

import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  backUrl?: string;
}

export default function PageHeader({ title, description, icon, action, backUrl }: PageHeaderProps) {
  return (
    <div className="bg-[oklch(0.48_0.11_190)] px-6 py-3 lg:px-10 flex flex-row items-center justify-between gap-4 relative overflow-hidden border-b border-white/[0.06] shrink-0 min-h-[85px] z-30">
      
      {/* ── MESH GRADIENT: NUBES VIAJERAS LIMPIAS Y LUMINOSAS ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Nube 1: Verde Aurora Brillante. Empieza a la izquierda y viaja. */}
        <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-[#00FFD5] opacity-30 blur-[90px] animate-travel-blob-1 mix-blend-screen"></div>
        
        {/* Nube 2: Luz Blanca. Reemplaza al naranja para evitar la "mancha oscura". Da un brillo limpio. */}
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-[#E600FF] opacity-[0.15] blur-[100px] animate-travel-blob-2 mix-blend-screen"></div>
      </div>

      {/* BLOQUE IZQUIERDO: Navegación + Contenido */}
      <div className="flex items-center gap-6 z-10 min-w-0">
        
        {/* Botón Volver */}
        {backUrl && (
          <Link 
            href={backUrl} 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white hover:border-white/20 active:scale-95 transition-all duration-300 group shrink-0 shadow-lg backdrop-blur-md"
            title="Volver"
          >
            <i className="bi bi-arrow-left text-xl transition-transform group-hover:-translate-x-1"></i>
          </Link>
        )}

        {/* Línea Divisoria */}
        {backUrl && (
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/[0.2] to-transparent shrink-0 hidden sm:block"></div>
        )}

        {/* Icono de Página e Información */}
        <div className="flex items-center gap-5 min-w-0">
          {icon && (
            <div className="text-lg text-white bg-white/10 w-11 h-11 rounded-xl border border-white/20 shrink-0 flex items-center justify-center shadow-lg backdrop-blur-md">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight leading-none mb-1.5 drop-shadow-md">
              {title}
            </h1>
            <p className="text-white/80 text-[11px] lg:text-xs font-medium uppercase tracking-[0.15em] drop-shadow-sm">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* BLOQUE DERECHO: Acciones */}
      {action && (
        <div className="relative z-10 shrink-0 md:pl-4">
          {action}
        </div>
      )}
    </div>
  );
}