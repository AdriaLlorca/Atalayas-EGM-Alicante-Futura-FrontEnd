'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

interface CompanyData {
  id: string;
  name: string;
  cif: string;
  activity: string;
  address: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  website: string;
}

export default function EditCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyData>({
    id: '',
    name: '',
    cif: '',
    activity: '',
    address: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    website: '',
  });

  useEffect(() => {
    const fetchMyCompany = async () => {
      try {
        const token = localStorage.getItem('token');
        // Usamos la ruta de "me" o "profile" para obtener la empresa del admin actual
const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
const companyId = savedUser?.companyId;
if (!companyId) { setLoading(false); return; }
const res = await fetch(API_ROUTES.COMPANIES.GET_BY_ID(companyId));
        const data = await res.json();
        if (data) setFormData(data);
      } catch (err) {
        console.error("Error cargando empresa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
const res = await fetch(API_ROUTES.COMPANIES.UPDATE(formData.id), {
  method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f5f5f7]">Cargando...</div>;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 p-10 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Perfil de Empresa</h1>
            <p className="text-[#86868b]">Actualiza la información pública y de contacto de tu entidad.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección: Información Básica (Lectura únicamente para el Admin Empresa) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 text-[#1d1d1f]">Datos Identificativos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    disabled 
                    className="w-full px-4 py-3 bg-[#f5f5f7] border border-transparent rounded-xl text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">CIF</label>
                  <input 
                    type="text" 
                    value={formData.cif} 
                    disabled 
                    className="w-full px-4 py-3 bg-[#f5f5f7] border border-transparent rounded-xl text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
              </div>
              <p className="mt-4 text-[11px] text-[#86868b] italic">
                * Para modificar el nombre legal o el CIF, contacte con el Administrador General de la plataforma.
              </p>
            </div>

            {/* Sección: Información Editable */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 text-[#1d1d1f]">Detalles de la Actividad</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">Sector / Actividad Principal</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Logística, Construcción, IT..."
                    value={formData.activity || ''} 
                    onChange={(e) => setFormData({...formData, activity: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-[#1d1d1f] text-sm transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">Descripción de la Empresa</label>
                  <textarea 
                    rows={4}
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-[#1d1d1f] text-sm transition-all outline-none resize-none"
                    placeholder="Breve descripción de lo que hace tu empresa..."
                  />
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 text-[#1d1d1f]">Información de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">Email de Contacto</label>
                  <input 
                    type="email" 
                    value={formData.contactEmail || ''} 
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-[#1d1d1f] text-sm transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.contactPhone || ''} 
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-[#1d1d1f] text-sm transition-all outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black uppercase text-[#86868b] mb-2 px-1">Dirección Física</label>
                  <input 
                    type="text" 
                    value={formData.address || ''} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-[#1d1d1f] text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#1d1d1f] hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-10 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${saving ? 'bg-gray-400' : 'bg-[#0071e3] hover:bg-[#0077ed]'}`}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}