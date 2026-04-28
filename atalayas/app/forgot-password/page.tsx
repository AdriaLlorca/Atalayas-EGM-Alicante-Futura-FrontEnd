'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_ROUTES.AUTH.FORGOT_PASSWORD}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'No se pudo enviar el correo');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-background">
      
      {/* =========================================
          LADO IZQUIERDO: FORMULARIO
      ========================================= */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10">
        
        {/* Cabecera / Logo */}
        <nav className="flex items-center px-8 lg:px-12 py-8">
          <Link href="/login" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary shadow-lg shadow-primary/20">
              <span className="text-primary-foreground text-lg font-extrabold">A</span>
            </div>
            <span className="text-foreground text-xl font-extrabold tracking-tight">
              Atalayas
            </span>
          </Link>
        </nav>

        {/* Contenedor Central */}
        <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-10">
          <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="mb-10">
              <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors mb-6">
                <i className="bi bi-arrow-left"></i> Volver
              </Link>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-3">
                Recuperar contraseña
              </h1>
              <p className="text-muted-foreground text-base">
                {submitted 
                  ? 'Revisa tu bandeja de entrada. Te hemos enviado un enlace seguro para restablecer tu contraseña.'
                  : 'Introduce el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones.'}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 bg-destructive/10 border border-destructive/20 animate-in fade-in">
                <i className="bi bi-exclamation-triangle-fill text-destructive text-lg"></i>
                <p className="text-destructive text-sm font-bold">{error}</p>
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleResetRequest} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground px-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@empresa.com"
                    required
                    className="w-full bg-card border border-input rounded-2xl px-5 py-4 text-sm text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-secondary-foreground font-bold rounded-2xl px-4 py-4 mt-4 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><i className="bi bi-arrow-repeat animate-spin text-lg"></i> Procesando...</>
                  ) : (
                    <><i className="bi bi-envelope-paper"></i> Enviar instrucciones</>
                  )}
                </button>
              </form>
            ) : (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-6 border border-primary/20">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <Link
                  href="/login"
                  className="w-full bg-card border border-border text-foreground font-bold rounded-2xl px-4 py-4 flex items-center justify-center gap-2 hover:bg-muted transition-all shadow-sm"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            )}

          </div>
        </main>

        {/* Footer del lado izquierdo */}
        <footer className="px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-muted-foreground">
            <p>© 2026 Atalayas EGM</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Soporte técnico</a>
            </div>
          </div>
        </footer>
      </div>

      {/* =========================================
          LADO DERECHO: IMAGEN Y BRANDING (Escritorio)
      ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        
        {/* Imagen de fondo */}
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Edificios modernos de oficinas" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/30"></div>

        {/* 🚀 SOLUCIÓN: Eliminado el delay-300 */}
        <div className="relative z-10 max-w-lg p-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8">
             <i className="bi bi-shield-lock text-white text-3xl"></i>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Seguridad en todo momento.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            Recupera tu acceso de forma rápida y segura para seguir disfrutando de todos los servicios del ecosistema de Alicante Futura.
          </p>
        </div>

      </div>
    </div>
  );
}