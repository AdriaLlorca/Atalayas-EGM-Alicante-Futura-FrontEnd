'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';

export default function NewCollaboratorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    type: 'ADMINISTRACIÓN PÚBLICA', 
    logoUrl: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard/administrator/general-admin/ecosystem');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          
          <Link 
            href="/dashboard/administrator/general-admin/community"
            className="inline-flex items-center gap-2 text-[#86868b] hover:text-[#1d1d1f] mb-8 transition-colors font-medium text-sm group"
          >
            <i className="bi bi-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            Volver al Ecosistema
          </Link>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-200">
            <header className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Nuevo Colaborador</h1>
              <p className="text-[#86868b] mt-2">Añade una entidad al ecosistema de proximidad de Atalayas.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Entidad */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#86868b] mb-2 px-1 tracking-widest">Nombre de la Entidad</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-bank"></i></span>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Ayuntamiento de Alicante"
                    className="w-full pl-11 pr-4 py-4 bg-[#f5f5f7] border-transparent focus:border-blue-500 focus:bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Tipo de Entidad (Ecosistema) */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#86868b] mb-2 px-1 tracking-widest">Tipo de Colaboración</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-diagram-3"></i></span>
                  <select 
                    className="w-full pl-11 pr-4 py-4 bg-[#f5f5f7] border-transparent focus:border-blue-500 focus:bg-white border rounded-2xl outline-none transition-all text-sm font-medium appearance-none"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="ADMINISTRACIÓN PÚBLICA">ADMINISTRACIÓN PÚBLICA</option>
                    <option value="FORMACIÓN Y TALENTO">FORMACIÓN Y TALENTO</option>
                    <option value="INNOVACIÓN Y TECNOLOGÍA">INNOVACIÓN Y TECNOLOGÍA</option>
                    <option value="CÁMARAS Y ASOCIACIONES">CÁMARAS Y ASOCIACIONES</option>
                    <option value="SINDICATOS">SINDICATOS</option>
                  </select>
                </div>
              </div>

              {/* URL del Logo */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#86868b] mb-2 px-1 tracking-widest">URL del Logo (PNG preferiblemente)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-image"></i></span>
                  <input 
                    type="url"
                    placeholder="https://atalayas.com/logo-colaborador.png"
                    className="w-full pl-11 pr-4 py-4 bg-[#f5f5f7] border-transparent focus:border-blue-500 focus:bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  />
                </div>
              </div>

              {/* Link Web */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#86868b] mb-2 px-1 tracking-widest">Enlace Directo (Web)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-globe"></i></span>
                  <input 
                    type="url"
                    placeholder="https://www.alicantefutura.org"
                    className="w-full pl-11 pr-4 py-4 bg-[#f5f5f7] border-transparent focus:border-blue-500 focus:bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-[#0071e3] text-white py-4 rounded-2xl font-bold hover:bg-[#0077ed] transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Guardando...' : <><i className="bi bi-check-circle-fill"></i> Publicar en Ecosistema</>}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}