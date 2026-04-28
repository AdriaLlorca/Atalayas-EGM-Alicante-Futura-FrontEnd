'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
}

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    companyId: '',
  });

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando empresas:', err);
      }
    };
    fetchCompanies();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.body.trim()) newErrors.body = 'El contenido es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const token = getToken();
      
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        isPublic: isPublic,
        companyId: isPublic ? null : (formData.companyId || null),
      };

      const res = await fetch('http://localhost:3000/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/administrator/general-admin/announcements');
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Error ${res.status}: ${data.message || 'No autorizado'}`);
      }
    } catch (err) {
      alert('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-5 py-3.5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] placeholder:text-[#c7c7cc] text-sm';

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[#0071e3] hover:text-[#0077ed] font-semibold mb-4 flex items-center gap-1 group text-sm"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver
            </button>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Crear anuncio</h1>
            <p className="text-[#86868b] mt-2 text-base">Configura la visibilidad y el contenido.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">Título</label>
              <input
                type="text"
                className={`${inputClass} ${errors.title ? 'border-red-400' : ''}`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">Contenido</label>
              <textarea
                rows={5}
                className={`${inputClass} resize-none ${errors.body ? 'border-red-400' : ''}`}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
              {errors.body && <p className="text-red-500 text-xs mt-1.5">{errors.body}</p>}
            </div>

            <div className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">Anuncio global</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {!isPublic && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">Empresa destinataria</label>
                <select
                  className={inputClass}
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                >
                  <option value="">Selecciona una empresa...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#1d1d1f] bg-white border border-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors disabled:opacity-50"
              >
                {loading ? 'Publicando...' : 'Publicar anuncio'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}