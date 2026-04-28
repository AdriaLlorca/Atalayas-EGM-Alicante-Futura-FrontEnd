'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';
import Link from 'next/link';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const inputClass = "w-full px-5 py-3.5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] text-sm placeholder:text-[#c7c7cc]";

export default function AdminServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '', description: '', mediaUrl: '',
    providerName: '', phone: '', email: '',
    address: '', schedule: '', externalUrl: '', price: '',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchService = async () => {
      if (typeof params.id !== 'string') return;
      try {
        const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setService(data);
        hydrateForm(data);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchService();
  }, [params.id]);

  const hydrateForm = (svc: any) => {
    setFormData({
      title: svc.title || '', description: svc.description || '', mediaUrl: svc.mediaUrl || '',
      providerName: svc.providerName || '', phone: svc.phone || '', email: svc.email || '',
      address: svc.address || '', schedule: svc.schedule || '',
      externalUrl: svc.externalUrl || '', price: svc.price || '',
    });
  };

  useEffect(() => {
    if (zoomRef.current && service?.mediaUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [service?.mediaUrl, isEditing]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setErrors({});
    if (!formData.title.trim()) { setErrors({ title: 'El título es obligatorio' }); return; }

    setSaving(true);
    const clean = (v: string) => v.trim() || null;
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          title: formData.title, description: clean(formData.description), mediaUrl: clean(formData.mediaUrl),
          providerName: clean(formData.providerName), phone: clean(formData.phone), email: clean(formData.email),
          address: clean(formData.address), schedule: clean(formData.schedule),
          externalUrl: clean(formData.externalUrl), price: clean(formData.price),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setService(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'No se pudo guardar'}`);
      }
    } catch { alert('No se pudo conectar con el servidor.'); }
    finally { setSaving(false); }
  };

  const handleDiscard = () => { hydrateForm(service); setErrors({}); setIsEditing(false); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) { router.push('/dashboard/administrator/admin/services'); router.refresh(); }
      else alert('No se pudo eliminar el servicio.');
    } catch { alert('Error de conexión.'); }
    finally { setDeleting(false); setShowDeleteModal(false); }
  };

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const canEdit = service && !service.isPublic; // Solo puede editar servicios de su empresa
  const hasContactInfo = service && (service.providerName || service.phone || service.email || service.address || service.schedule || service.price || service.externalUrl);

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
  if (!service) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont }}>
      <Sidebar role="ADMIN" />

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <Link
              href="/dashboard/administrator/admin/services"
              className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
            >
              <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
              <span>Volver a Servicios</span> {/* Opcional: añadir texto mejora el SEO y accesibilidad */}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ width: '72px', height: '72px', background: 'rgba(0,113,227,0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
                🏢
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em', margin: 0 }}>
                  {service.title}
                </h1>
                <span style={{
                  display: 'inline-block', marginTop: '8px', fontSize: '12px', fontWeight: 700,
                  color: service.isPublic ? '#34c759' : '#0071e3',
                  background: service.isPublic ? 'rgba(52,199,89,0.1)' : 'rgba(0,113,227,0.1)',
                  padding: '4px 10px', borderRadius: '999px'
                }}>
                  {service.isPublic ? '🌐 Público' : '🏢 Tu empresa'}
                </span>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 animate-in fade-in duration-300">
                  ✓ Cambios guardados
                </span>
              )}

              {/* Botones solo si puede editar */}
              {canEdit && (
                <div className="flex items-center gap-3 shrink-0">
                  {!isEditing ? (
                    <>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                        Eliminar
                      </button>
                      <button onClick={() => setIsEditing(true)}
                        className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors">
                        Editar servicio
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleDiscard}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-[#424245] bg-[#f5f5f7] hover:bg-gray-200 transition-colors">
                        Descartar
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors disabled:opacity-60">
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="content-layout">

            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#1d1d1f', marginBottom: '20px' }}>
                {isEditing ? 'Editando información' : 'Sobre el servicio'}
              </h3>

              {isEditing ? (
                <div className="space-y-5">

                  {/* Info principal */}
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">Información principal</p>

                    <div className="space-y-1">
                      <input value={formData.title} onChange={e => { set('title', e.target.value); if (errors.title) setErrors({}); }}
                        placeholder="Título del servicio..."
                        className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${errors.title ? 'border-2 border-red-400 bg-red-50/30 text-red-900' : 'border-2 border-transparent bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white text-[#1d1d1f]'}`}
                      />
                      {errors.title && <p className="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">⚠️ {errors.title}</p>}
                    </div>

                    <textarea rows={5} value={formData.description} onChange={e => set('description', e.target.value)}
                      placeholder="Descripción detallada..."
                      className="w-full px-5 py-4 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all resize-none text-[#424245] leading-relaxed text-sm placeholder:text-[#c7c7cc]"
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#86868b] ml-1">Imagen (URL)</label>
                      <input type="url" value={formData.mediaUrl} onChange={e => set('mediaUrl', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg" className={inputClass} />
                      {formData.mediaUrl && <p className="text-xs text-green-600 font-medium ml-1">✓ Enlace detectado</p>}
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">Datos de contacto</p>
                      <p className="text-xs text-[#86868b] mt-1">Todos opcionales.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Proveedor / Empresa</label>
                      <input value={formData.providerName} onChange={e => set('providerName', e.target.value)}
                        placeholder="Ej: Gestoría García" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Teléfono</label>
                        <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="600 000 000" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Email</label>
                        <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                          placeholder="contacto@empresa.com" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Dirección</label>
                      <input value={formData.address} onChange={e => set('address', e.target.value)}
                        placeholder="Dirección del servicio" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Horario</label>
                        <input value={formData.schedule} onChange={e => set('schedule', e.target.value)}
                          placeholder="Lun–Vie 9:00–18:00" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Precio</label>
                        <input value={formData.price} onChange={e => set('price', e.target.value)}
                          placeholder="Gratuito para empleados" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">Enlace externo</label>
                      <input type="url" value={formData.externalUrl} onChange={e => set('externalUrl', e.target.value)}
                        placeholder="https://..." className={inputClass} />
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="border border-red-200 rounded-[2rem] p-6 bg-red-50/30">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-bold text-[#1d1d1f] text-sm">Eliminar este servicio</p>
                        <p className="text-xs text-[#86868b] mt-0.5">Acción permanente, no se puede deshacer.</p>
                      </div>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors">
                        Eliminar servicio
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#424245', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>
                    {service.description || 'No hay descripción disponible.'}
                  </p>

                  {service.mediaUrl && (
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">
                        <img ref={zoomRef} src={service.mediaUrl} alt={service.title} className="w-full h-auto cursor-zoom-in" />
                      </div>
                    </div>
                  )}

                  {hasContactInfo && (
                    <div className="action-box-mobile">
                      <ContactCard service={service} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ACTION BOX LATERAL */}
            {!isEditing && hasContactInfo && (
              <div className="action-box">
                <ContactCard service={service} />
              </div>
            )}
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-6 text-center">🗑️</div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3 text-center tracking-tight">¿Eliminar servicio?</h2>
            <p className="text-[15px] text-[#86868b] mb-8 text-center leading-relaxed">
              Estás a punto de eliminar <span className="font-semibold text-[#1d1d1f]">"{service.title}"</span>. Esta acción es permanente.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="w-full py-4 rounded-2xl font-bold bg-[#ff3b30] text-white hover:bg-[#e32d24] active:scale-[0.98] transition-all disabled:opacity-60">
                {deleting ? 'Eliminando...' : 'Eliminar servicio'}
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 rounded-2xl font-semibold text-[#0071e3] hover:bg-[#f5f5f7] transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .content-layout { display: grid; grid-template-columns: 1fr 300px; gap: 48px; }
        .action-box { display: block; }
        .action-box-mobile { display: none; }
        @media (max-width: 1024px) {
          .content-layout { grid-template-columns: 1fr; gap: 0; }
          .action-box { display: none; }
          .action-box-mobile { display: block; margin-bottom: 32px; }
        }
      `}</style>
    </div>
  );
}