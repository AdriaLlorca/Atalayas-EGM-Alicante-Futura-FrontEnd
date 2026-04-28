'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import CompanyDropdown from '@/components/ui/CompanyDropdown';

export default function NewGeneralService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    isPublic: true,
    companyId: '',
    // Campos de contacto
    providerName: '',
    email: '',
    phone: '',
    address: '',
    schedule: '',
    externalUrl: '',
    price: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: 'El título es obligatorio' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    // Limpiamos strings vacíos → null para no enviar campos vacíos
    const clean = (v: string) => v.trim() || null;

    const dataToSubmit = {
      title: formData.title,
      description: clean(formData.description),
      mediaUrl: clean(formData.mediaUrl),
      isPublic: formData.isPublic,
      companyId: formData.isPublic ? null : formData.companyId,
      providerName: clean(formData.providerName),
      email: clean(formData.email),
      phone: clean(formData.phone),
      address: clean(formData.address),
      schedule: clean(formData.schedule),
      externalUrl: clean(formData.externalUrl),
      price: clean(formData.price),
    };

    try {
      const res = await fetch(API_ROUTES.SERVICES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard/administrator/general-admin/services');
        router.refresh();
      } else {
        alert(`Error del servidor: ${data.message || 'No se pudo crear el servicio'}`);
      }
    } catch {
      alert('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const companyNames = ['PUBLIC', ...companies.map((c) => c.name)];

  const inputClass = 'w-full px-6 py-4 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] placeholder:text-[#c7c7cc]';

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          {/* Cabecera */}
          <header className="mb-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[#0071e3] hover:text-[#0077ed] font-semibold mb-4 flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver
            </button>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Crear nuevo servicio</h1>
            <p className="text-[#86868b] mt-2 text-lg">Configura la visibilidad y el contenido del servicio.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── SECCIÓN 1: VISIBILIDAD ─────────────────────────────── */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b] mb-6">
                Asignación de Visibilidad
              </label>

              <CompanyDropdown
                companies={companyNames}
                selected={selectedCompany}
                onChange={(val) => {
                  setSelectedCompany(val);
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: val === 'PUBLIC',
                    companyId: companies.find((c) => c.name === val)?.id || '',
                  }));
                }}
              />

              <div className={`mt-4 p-4 rounded-2xl transition-colors ${formData.isPublic ? 'bg-green-50/50 text-green-700' : 'bg-blue-50/50 text-blue-700'}`}>
                <p className="text-sm font-medium">
                  {formData.isPublic
                    ? '🌐 Este servicio será visible para todos los usuarios de Atalayas.'
                    : `🏢 Servicio exclusivo para empleados de ${selectedCompany}.`}
                </p>
              </div>
            </section>

            {/* ── SECCIÓN 2: INFORMACIÓN PRINCIPAL ──────────────────── */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">
                Información Principal
              </label>

              {/* Título */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Título del servicio..."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({});
                  }}
                  className={`w-full px-6 py-5 rounded-2xl outline-none transition-all text-xl font-bold ${
                    errors.title
                      ? 'border-2 border-red-400 bg-red-50/30 text-red-900'
                      : 'border-2 border-transparent bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white text-[#1d1d1f]'
                  }`}
                />
                <div className="h-5 ml-4">
                  {errors.title && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <span>⚠️</span> {errors.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <textarea
                placeholder="Descripción detallada del servicio..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-6 py-5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all resize-none text-[#424245] leading-relaxed placeholder:text-[#c7c7cc]"
              />

              {/* Imagen */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b] ml-1">
                  Imagen de portada (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://tusitio.com/imagen.jpg"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className={inputClass}
                />
                {formData.mediaUrl && (
                  <div className="mt-3 rounded-2xl overflow-hidden h-36 w-full border border-gray-100">
                    <img
                      src={formData.mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── SECCIÓN 3: DATOS DE CONTACTO ──────────────────────── */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">
                  Datos de Contacto
                </label>
                <p className="text-xs text-[#86868b] mt-1">Todos los campos son opcionales.</p>
              </div>

              {/* Proveedor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#86868b] ml-1">Proveedor / Empresa</label>
                <input
                  type="text"
                  placeholder="Ej: Wincontrol Seguridad S.L."
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Teléfono + Email en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#86868b] ml-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="647 76 33 89"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#86868b] ml-1">Email</label>
                  <input
                    type="email"
                    placeholder="contacto@servicio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#86868b] ml-1">Dirección</label>
                <input
                  type="text"
                  placeholder="C/ Chelín, Parcela 22, Planta 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Horario + Precio en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#86868b] ml-1">Horario</label>
                  <input
                    type="text"
                    placeholder="Lun–Vie 9:00–14:00"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#86868b] ml-1">Precio</label>
                  <input
                    type="text"
                    placeholder="Gratuito / Desde 20€/mes"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Enlace externo */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#86868b] ml-1">Enlace externo</label>
                <input
                  type="url"
                  placeholder="https://journify.com/atalayas"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  className={inputClass}
                />
              </div>
            </section>

            {/* ── BOTÓN SUBMIT ───────────────────────────────────────── */}
            <div className="pb-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold hover:bg-[#0077ed] transition-all disabled:opacity-60 text-base"
              >
                {loading ? 'Publicando...' : 'Publicar Servicio'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}