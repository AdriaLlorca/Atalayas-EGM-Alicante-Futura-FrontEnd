'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewEmployeePage() {
  const router = useRouter();
  
  // 1. Referencia para el Rol (Uncontrolled)
  const roleRef = useRef<HTMLSelectElement>(null);

  // 2. Estados del resto del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState(''); // Estado para la empresa (General Admin)
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  // Carga de datos de usuario y empresas
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      if (user.role === 'GENERAL_ADMIN') {
        fetch(API_ROUTES.COMPANIES.GET_ALL, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCompanies(data); });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // LEEMOS EL ROL DIRECTAMENTE DEL ELEMENTO HTML
    const selectedRole = roleRef.current?.value || 'PUBLIC';
    
    try {
      const token = localStorage.getItem('token');
      const finalCompanyId = currentUser.role === 'ADMIN' ? currentUser.companyId : companyId;

      const payload = { 
        email, 
        password, 
        name, 
        role: selectedRole, // <--- Valor real del selector
        companyId: finalCompanyId || undefined
      };

      const res = await fetch(API_ROUTES.USERS.CREATE, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear el empleado');

      router.push('/dashboard/administrator/employees');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role={currentUser.role} />
      <main className="flex-1 p-10 overflow-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#86868b] hover:text-[#1d1d1f] font-medium text-sm mb-6 transition-colors">
          ← Volver
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Añadir nuevo empleado</h1>
          <p className="text-[#86868b]">Introduce los datos para el nuevo acceso al sistema.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
          {error && <div className="p-3 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" required className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" required className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Rol</label>
                <select 
                  ref={roleRef}
                  defaultValue="PUBLIC"
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3 text-sm outline-none cursor-pointer border-transparent focus:border-[#0071e3] transition-all"
                >
                  {currentUser.role === 'GENERAL_ADMIN' && <option value="PUBLIC">Acceso público</option> }
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="ADMIN">Administrador de empresa</option>
                  {currentUser.role === 'GENERAL_ADMIN' && <option value="GENERAL_ADMIN">Administrador General</option>}
                </select>
              </div>

              {currentUser.role === 'GENERAL_ADMIN' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Empresa asignada</label>
                  <select 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)} 
                    required 
                    className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                  >
                    <option value="">Seleccionar empresa...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-md active:scale-95 disabled:bg-gray-400"
              >
                {loading ? 'Creando...' : 'Crear empleado'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}