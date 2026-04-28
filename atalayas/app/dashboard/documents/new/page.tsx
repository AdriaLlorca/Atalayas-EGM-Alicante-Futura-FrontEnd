'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewDocumentPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [companyId, setCompanyId] = useState(''); // Opcional (UUID) para General Admin
  const [userId, setUserId] = useState('');       // Opcional (UUID)
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        // Solo cargamos la lista de empresas si es General Admin
        if (user.role === 'GENERAL_ADMIN') {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (Array.isArray(data)) setCompanies(data);
            else if (data?.data && Array.isArray(data.data)) setCompanies(data.data);
            else if (data?.companies && Array.isArray(data.companies)) setCompanies(data.companies);
          } catch (error) {
            console.error("Error al cargar empresas:", error);
          }
        }
      }
    };
    loadInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Debes seleccionar un archivo físico.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', title);
      formData.append('file', file);
      formData.append('isPublic', isPublic.toString());
      
      // Lógica de envíos de IDs
      if (currentUser.role === 'GENERAL_ADMIN') {
        if (companyId.trim() !== '') formData.append('companyId', companyId);
      } else {
        if (currentUser.companyId) formData.append('companyId', currentUser.companyId);
      }

      if (userId.trim() !== '') {
        formData.append('userId', userId.trim());
      }

      const res = await fetch(API_ROUTES.DOCUMENTS.GET_ALL, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorMsg || 'Error al subir el documento');
      }

      router.back();
      router.refresh();
      
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
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Subir Documento</h1>
          <p className="text-[#86868b]">Añade archivos al sistema y configura su visibilidad.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
          {error && <div className="p-3 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Título del Documento *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ej: Manual de Prevención de Riesgos" 
                required 
                className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Archivo Físico *</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                required 
                className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-3 text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0071e3] file:text-white hover:file:bg-[#0077ed] cursor-pointer" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Visibilidad</label>
                <select 
                  value={isPublic ? 'true' : 'false'} 
                  onChange={(e) => setIsPublic(e.target.value === 'true')} 
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3 text-sm outline-none cursor-pointer border-transparent focus:border-[#0071e3] transition-all"
                >
                  <option value="true">Público (Visible para todos)</option>
                  <option value="false">Privado (Solo seleccionados)</option>
                </select>
              </div>

              {/* 🚀 LÓGICA DE INTERFAZ PARA EMPRESAS */}
              {currentUser.role === 'GENERAL_ADMIN' ? (
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Empresa asignada</label>
                  <select 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)} 
                    className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3 text-sm outline-none cursor-pointer border-transparent focus:border-[#0071e3] transition-all"
                  >
                    <option value="">Global (Sin empresa específica)</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Empresa asignada</label>
                  <input 
                    type="text" 
                    disabled 
                    value="Viculado a tu empresa" 
                    className="w-full bg-gray-100 border-transparent rounded-xl px-4 py-3 text-sm outline-none text-gray-500 cursor-not-allowed" 
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">ID del Empleado (Opcional)</label>
                <input 
                  type="text" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)} 
                  placeholder="Pega el UUID del usuario si es exclusivo" 
                  className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" 
                />
                <p className="text-xs text-[#86868b] mt-1.5">Si es un documento confidencial para un único usuario, pega aquí su identificador.</p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="submit" 
                disabled={loading || !file || !title} 
                className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-md active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
              >
                {loading ? 'Subiendo...' : 'Subir documento'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}