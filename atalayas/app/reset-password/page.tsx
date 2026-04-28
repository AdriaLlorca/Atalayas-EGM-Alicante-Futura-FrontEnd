'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_ROUTES.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, newPassword: password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
      
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
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-3">
                Nueva contraseña
              </h1>
              <p className="text-muted-foreground text-base">
                {success 
                  ? 'Contraseña actualizada correctamente. Serás redirigido en unos segundos...' 
                  : 'Crea una contraseña segura para restablecer el acceso a tu cuenta.'}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 bg-destructive/10 border border-destructive/20 animate-in fade-in">
                <i className="bi bi-exclamation-triangle-fill text-destructive text-lg"></i>
                <p className="text-destructive text-sm font-bold">{error}</p>
              </div>
            )}

            {success ? (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-6 border border-primary/20">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <div className="w-full bg-card border border-border text-foreground font-bold rounded-2xl px-4 py-4 flex items-center justify-center gap-3 shadow-sm">
                  <i className="bi bi-arrow-repeat animate-spin text-xl"></i> Redirigiendo al login...
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground px-1">Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-card border border-input rounded-2xl px-5 py-4 text-sm text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground px-1">Confirmar contraseña</label>
                  <input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-card border border-input rounded-2xl px-5 py-4 text-sm text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-secondary-foreground font-bold rounded-2xl px-4 py-4 mt-6 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><i className="bi bi-arrow-repeat animate-spin text-lg"></i> Guardando...</>
                  ) : (
                    <><i className="bi bi-floppy"></i> Actualizar contraseña</>
                  )}
                </button>
              </form>
            )}

          </div>
        </main>

        {/* Footer del lado izquierdo */}
        <footer className="px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-muted-foreground">
            <p>© 2026 Atalayas EGM</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Soporte</a>
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
        
        {/* Capa de gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/30"></div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 max-w-lg p-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8">
             <i className="bi bi-key text-white text-3xl"></i>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Tu cuenta, siempre segura.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            Actualiza tus credenciales para continuar accediendo a todas las herramientas, cursos y recursos de Alicante Futura.
          </p>
        </div>

      </div>
    </div>
  );
}