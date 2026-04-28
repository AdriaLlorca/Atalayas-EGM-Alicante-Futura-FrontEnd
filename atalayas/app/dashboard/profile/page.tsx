'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
    const fromTaskId = searchParams.get('fromTask');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setName(user.name || '');
      setEmail(user.email || '');
      setCurrentAvatarUrl(user.avatarUrl || null);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
  const autoConfirmTask = async () => {
    if (fromTaskId) {
      try {
        const token = localStorage.getItem("token");
        await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taskId: fromTaskId, done: true }),
        });
        console.log("Tarea de onboarding completada automáticamente");
      } catch (err) {
        console.error("Error al autocompletar:", err);
      }
    }
  };

  autoConfirmTask();
}, [fromTaskId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // --- VALIDACIONES DE CONTRASEÑA ---
    if (password) {
      if (password.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (name) formData.append('name', name);
      if (password) formData.append('password', password);
      if (newFile) formData.append('file', newFile); 

      const res = await fetch(API_ROUTES.AUTH.PROFILE, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorMsg || 'Error actualizando el perfil');
      }

      // Mezclar datos antiguos con nuevos para no perder el objeto Company
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        ...data
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      setCurrentAvatarUrl(updatedUser.avatarUrl);
      
      setNewFile(null);
      setAvatarPreview(null);
      setPassword('');
      setConfirmPassword('');
      setSuccess('Perfil actualizado correctamente.');

      // Opcional: Solo recargar si cambió la foto para refrescar el Sidebar
      if (newFile) {
          window.location.reload();
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role={currentUser.role} />
      
      <main className="flex-1 p-6 lg:p-10 overflow-auto flex justify-center">
        <div className="w-full max-w-2xl">
          
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tus datos personales y seguridad.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-8">
            
            {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">{error}</div>}
            {success && <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-medium">{success}</div>}

            {/* AVATAR */}
            <div className="flex flex-col items-center gap-4 border-b border-border pb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={avatarPreview || (currentAvatarUrl ? encodeURI(currentAvatarUrl) : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-inner transition-opacity group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">Cambiar foto</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {/* DATOS PERSONALES */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground border-l-4 border-primary pl-3">Datos Personales</h2>
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Correo Electrónico (No editable)</label>
                <input type="email" value={email} disabled className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-muted-foreground cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Nombre Completo *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
              </div>
            </div>

            {/* SEGURIDAD */}
            <div className="space-y-5 pt-4">
              <h2 className="text-lg font-bold text-foreground border-l-4 border-primary pl-3">Seguridad</h2>
              <p className="text-sm text-muted-foreground">Rellena estos campos solo si quieres cambiar tu contraseña actual.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Nueva Contraseña</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Opcional (Mín. 6 chars)" className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Confirmar Contraseña</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-border flex justify-end">
              <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-sm text-secondary-foreground bg-secondary hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Guardando...' : 'Guardar Perfil'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}