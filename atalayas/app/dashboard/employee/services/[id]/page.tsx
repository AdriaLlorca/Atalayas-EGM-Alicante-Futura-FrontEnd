'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setService(data);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetail();
  }, [params.id]);

  useEffect(() => {
    if (zoomRef.current && service?.mediaUrl) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [service?.mediaUrl]);

  if (!service) return null;


  const hasContactInfo = service.providerName || service.phone || service.email || service.address || service.schedule || service.price || service.externalUrl;

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <Sidebar role = 'EMPLOYEE' />
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginBottom: '24px', padding: 0 }}
            >
              ‹ Volver a servicios
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{
                width: '72px', height: '72px', background: 'rgba(0,113,227,0.1)',
                borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0
              }}>
                <i className="bi bi-suitcase-lg-fill text-[#005596]"></i>
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
                  {service.isPublic ? <span className="flex items-center gap-2">
                    <i className="bi bi-globe text-green-400"></i> Público
                  </span>: <span className="flex items-center gap-2">
                    <i className="bi bi-building-fill text-blue-400"></i> Mi
                    empresa{" "}
                  </span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="content-layout">

            {/* COLUMNA PRINCIPAL */}
            <div>
              {/* Descripción */}
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>Sobre el servicio</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#424245', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>
                {service.description || 'No hay una descripción disponible para este servicio.'}
              </p>

              {/* Imagen */}
              {service.mediaUrl && (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">
                    <img
                      ref={zoomRef}
                      src={service.mediaUrl}
                      alt={service.title}
                      className="w-full h-auto cursor-zoom-in"
                    />
                  </div>
                </div>
              )}

              {/* Info de contacto en móvil (debajo de descripción) */}
              {hasContactInfo && (
                <div className="action-box-mobile">
                  <ContactCard service={service} />
                </div>
              )}
            </div>

            {/* ACTION BOX LATERAL */}
            {hasContactInfo && (
              <div className="action-box">
                <ContactCard service={service} />
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .content-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 48px;
        }
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