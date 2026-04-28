'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export default function EmployeeContentDetail() {
  const params = useParams();
  const zoomRef = useRef<HTMLImageElement>(null);
  const searchParams = useSearchParams();

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const contentId = params.contentId;
      const courseId = params.id;
      if (!contentId || !courseId) return;

      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(contentId as string, courseId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        const finalData = data.content || data.data || data;
        setContent(finalData);
      } catch (error) {
        console.error("Error al cargar la lección:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  useEffect(() => {
    if (zoomRef.current && content?.imageUrl) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(255,255,255,0.95)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [content?.imageUrl]);

  useEffect(() => {
  const completeTask = async () => {
    const fromTaskId = searchParams.get('fromTask');
    
    // Si venimos de una tarea de onboarding y el contenido ha cargado bien
    if (fromTaskId && content) {
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
        console.error("Error al autocompletar tarea:", err);
      }
    }
  };

  completeTask();
}, [content, searchParams]);

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (!content) return null;

  // Verificamos si existen recursos para mostrar la barra lateral
  const hasResources = content.url || content.podcast;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <Link href={`/dashboard/employee/courses/${params.id}`}
              style={{ color: '#0071e3', fontSize: '15px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
              ‹ Volver al curso
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(0,113,227,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                📖
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em', margin: 0 }}>
                  {content.title}
                </h1>
                <span className="inline-block mt-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Lección {content.order || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CUERPO DINÁMICO */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
          <div className={hasResources ? "content-with-sidebar" : "content-full"}>
            
            <article>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1d1d1f', marginBottom: '20px' }}>
                Desarrollo de la unidad
              </h3>

              <div className="prose prose-slate max-w-none">
                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#424245', whiteSpace: 'pre-wrap' }}>
                  {content.summary || 'Sin contenido proporcionado'}
                </p>
              </div>
            </article>

            {/* SOLO SE MUESTRA SI HAY RECURSOS */}
            {hasResources && (
              <aside className="space-y-6">
                <h4 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] px-1">Material Extra</h4>
                
                {content.url && (
                  <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm text-center">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-[11px] font-black text-[#1d1d1f] uppercase mb-5">Guía PDF</p>
                    <a href={content.url} target="_blank" rel="noopener noreferrer"
                      className="block w-full py-3 bg-[#0071e3] text-white rounded-xl text-xs font-bold hover:bg-[#0077ed] transition-all">
                      Abrir PDF
                    </a>
                  </div>
                )}
                
                {content.podcast && (
                  <div className="bg-[#1d1d1f] p-6 rounded-[2rem] text-white shadow-xl shadow-black/10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🎙️</span>
                      <p className="text-[10px] font-black opacity-60 tracking-widest uppercase">Podcast</p>
                    </div>
                    <button className="w-full py-2.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                      Escuchar Resumen
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .content-with-sidebar { 
          display: grid; 
          grid-template-columns: 1fr 300px; 
          gap: 64px; 
        }
        .content-full { 
          max-width: 800px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .content-with-sidebar { 
            grid-template-columns: 1fr; 
            gap: 48px; 
          }
        }
      `}</style>
    </div>
  );
}