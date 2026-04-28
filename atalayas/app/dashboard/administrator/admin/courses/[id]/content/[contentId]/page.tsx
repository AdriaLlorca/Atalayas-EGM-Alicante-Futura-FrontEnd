"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";

const appleFont =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const inputClass =
  "w-full px-5 py-3.5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] text-sm placeholder:text-[#c7c7cc]";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  
  // 🚀 REFERENCIAS PARA EL AUDIO
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSavedSecond = useRef<number>(0);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // 🚀 ESTADOS DEL QUIZ
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    imageUrl: '',
    url: '', 
    quiz: null as any,
    podcast: null as any,
  });

  // ── Fetch (ACTUALIZADO CON DOS PARÁMETROS) ──────────────────────────────────
  useEffect(() => {
    const fetchContent = async () => {
      const courseId = params.id as string;
      const contentId = params.contentId as string;

      if (!courseId || !contentId) return;

      try {
        // 🚀 Cambio: Enviamos curso y contenido
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        const finalData = data.content || data.data || data;
        
        console.log("📥 Datos recibidos de la lección:", finalData);
        
        setContent(finalData);
        hydrateForm(finalData);
      } catch (error) {
        console.error("❌ Error cargando el contenido:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  const hydrateForm = (c: any) => {
    setFormData({
      title: c.title || "",
      summary: c.summary || "",
      imageUrl: c.imageUrl || "",
      url: c.url || "",
      quiz: c.quiz || null,
      podcast: c.podcast || null,
    });
  };

  useEffect(() => {
    if (zoomRef.current && content?.imageUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, {
        background: "rgba(0,0,0,0.8)",
        margin: 24,
      });
      return () => {
        zoom.detach();
      };
    }
  }, [content?.imageUrl, isEditing]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fakeUrl = "https://tu-storage.com/pdf-actualizado.pdf"; 
      setFormData(prev => ({ ...prev, url: fakeUrl }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    if (!formData.title.trim()) { setErrors({ title: 'El título es obligatorio' }); return; }
    
    setSaving(true);
    try {
      // 🚀 También actualizamos la ruta aquí
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...formData }),
      });
      if (res.ok) {
        const updated = await res.json();
        setContent(updated.content || updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // 🚀 También actualizamos la ruta aquí
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) { 
        router.push(`/dashboard/administrator/admin/courses/${params.id}`); 
        router.refresh(); 
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleQuizSubmit = async () => {
    let correctCount = 0;
    content.quiz.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correctAnswer) correctCount++;
    });
    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount === content.quiz.length) {
      const token = localStorage.getItem('token');
      await fetch(`${API_ROUTES.ENROLLMENTS.BASE}/complete-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ contentId: content.id })
      });
      router.refresh();
    }
  };

  const set = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  if (loading)
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  if (!content) return null;

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f7]"
      style={{
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      {" "}
      <Sidebar role="ADMIN" />

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <Link href={`/dashboard/administrator/admin/courses/${params.id}`}
              style={{ color: '#0071e3', fontSize: '15px', fontWeight: 500, textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
              ‹ Volver a la unidad
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ width: '72px', height: '72px', background: 'rgba(0,113,227,0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>📚</div>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em', margin: 0 }}>
                  {formData.title || content?.title || "Cargando título..."}
                </h1>
                <span className="inline-block mt-2 text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Unidad de aprendizaje</span>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 animate-in fade-in duration-300">✓ Cambios guardados</span>
              )}

              <div className="flex items-center gap-3 shrink-0">
                {!isEditing ? (
                  <>
                    <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">Eliminar</button>
                    <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors">Editar unidad</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { hydrateForm(content); setIsEditing(false); }} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#424245] bg-[#f5f5f7] hover:bg-gray-200 transition-colors">Descartar</button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="content-layout">
            <div>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#1d1d1f",
                  marginBottom: "20px",
                }}
              >
                {isEditing
                  ? "Configurar contenido"
                  : "Información de la lección"}
              </h3>

              {isEditing ? (
                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">Texto e Imagen</p>
                    <div className="space-y-1">
                      <input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="Título..." className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${errors.title ? 'border-2 border-red-400 bg-red-50/30' : 'border-2 border-transparent bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white'}`} />
                      {errors.title && <p className="text-red-500 text-xs font-bold ml-2">⚠️ {errors.title}</p>}
                    </div>
                    <textarea rows={8} value={formData.summary} onChange={e => set('summary', e.target.value)} placeholder="Cuerpo..." className="w-full px-5 py-4 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all resize-none text-[#424245] leading-relaxed" />
                    <input value={formData.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="URL Imagen..." className={inputClass} />
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">Documento PDF / Audio URL</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input value={formData.url} onChange={e => set('url', e.target.value)} placeholder="Link directo..." className={inputClass} />
                       <div className="relative h-12.5 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 hover:border-blue-400 transition-all cursor-pointer">
                          <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <span className="text-xs font-bold text-blue-600">{uploading ? 'Subiendo...' : '📥 Subir nuevo PDF'}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#424245', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>{content.summary || 'Sin contenido redactado.'}</p>
                  {content.imageUrl && (
                    <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <img
                        ref={zoomRef}
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-auto cursor-zoom-in"
                      />
                    </div>
                  )}

                  {/* 🚀 QUIZ INTERACTIVO */}
                  {content.quiz && (
                    <div className="mt-12 bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center"><i className="bi bi-patch-question text-3xl text-orange-500"></i></div>
                        <div>
                          <h3 className="text-2xl font-black text-[#1d1d1f]">Test de Comprensión</h3>
                          <p className="text-[#86868b] text-sm mt-1">Supera el test para guardar tu progreso.</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {content.quiz.map((pregunta: any, index: number) => {
                          const bgClass = quizSubmitted ? (quizAnswers[index] === pregunta.correctAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200") : "bg-[#f5f5f7]";
                          return (
                            <div key={index} className={`p-6 rounded-3xl transition-colors ${bgClass}`}>
                              <p className="font-bold text-[#1d1d1f] text-lg mb-4">{index + 1}. {pregunta.question}</p>
                              <div className="flex flex-col gap-3">
                                {pregunta.options.map((opcion: string, i: number) => (
                                  <label key={i} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[index] === opcion ? 'border-orange-500 bg-orange-50' : 'bg-white border-transparent hover:border-orange-200'}`}>
                                    <input type="radio" name={`q-${index}`} checked={quizAnswers[index] === opcion} onChange={() => !quizSubmitted && setQuizAnswers(prev => ({...prev, [index]: opcion}))} className="w-5 h-5 accent-orange-500" />
                                    <span className="text-[#424245] font-medium">{opcion}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!quizSubmitted ? (
                        <button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < content.quiz.length} className="mt-8 w-full py-5 bg-[#1d1d1f] text-white rounded-2xl font-bold hover:bg-black transition-colors disabled:bg-gray-300">Corregir Test</button>
                      ) : (
                        <div className="mt-8 p-6 bg-blue-50 rounded-2xl text-center border border-blue-100">
                          <h4 className="text-2xl font-black text-[#005596] mb-2">Puntuación: {quizScore} / {content.quiz.length}</h4>
                          {quizScore === content.quiz.length ? <p className="text-green-600 font-bold">¡Perfecto! Progreso guardado.</p> : <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="mt-4 px-8 py-3 bg-[#005596] text-white rounded-xl font-bold">Reintentar</button>}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* BARRA LATERAL (Con lógica de audio segura) */}
            {!isEditing && (
              <aside className="action-box space-y-4">
                {content.url && !content.url.includes('.mp3') && (
                  <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm text-center">
                    <div className="text-3xl mb-3">📄</div>
                    <p className="text-xs font-bold text-[#86868b] uppercase mb-4">Material de Estudio</p>
                    <a href={content.url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-[#1d1d1f] text-white rounded-xl text-xs font-bold hover:bg-black transition-all">Abrir documento</a>
                  </div>
                )}
                
                {content.url && content.url.includes('.mp3') && (
                  <div className="bg-[#0071e3] p-6 rounded-[2rem] text-white shadow-lg shadow-blue-500/20 text-center">
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2 flex items-center gap-1"><i className="bi bi-robot"></i> AI Podcast</p>
                    <h4 className="text-sm font-bold mb-4 leading-tight">Escucha la lección</h4>
                    <audio 
                      ref={audioRef}
                      controls 
                      className="w-full h-10 rounded-lg" 
                      src={content.url}
                      onCanPlay={() => {
                        // 🚀 RECUPERAR PROGRESO AL CARGAR
                        const savedTime = content.userProgresses?.[0]?.lastTime || 0;
                        if (audioRef.current && savedTime > 0 && lastSavedSecond.current === 0) {
                          console.log(`🎬 Resumiendo audio desde: ${savedTime}s`);
                          audioRef.current.currentTime = savedTime;
                          lastSavedSecond.current = savedTime;
                        }
                      }}
                      onTimeUpdate={async (e) => {
                        const target = e.target as HTMLAudioElement;
                        const currentSec = Math.floor(target.currentTime);
                        const totalDur = Math.floor(target.duration || 0);

                        // Solo guardamos cada 10 segundos
                        if (currentSec > 0 && currentSec % 10 === 0 && currentSec !== lastSavedSecond.current) {
                          lastSavedSecond.current = currentSec;
                          try {
                            const token = localStorage.getItem('token');
                            await fetch(`${API_ROUTES.ENROLLMENTS.BASE}/video-progress`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ contentId: content.id, lastTime: Math.floor(Number(currentSec)), totalDuration: Math.floor(Number(totalDur)) })
                            });
                            console.log(`💾 Guardado segundo ${currentSec}`);
                          } catch (err) { console.error(err); }
                        }
                      }}
                    />
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </main>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-6 text-center">🗑️</div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3 text-center">¿Eliminar contenido?</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} className="w-full py-4 rounded-2xl font-bold bg-[#ff3b30] text-white">Eliminar</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 rounded-2xl font-semibold text-[#0071e3]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .content-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .action-box {
            margin-top: 32px;
          }
        }
      `}</style>
    </div>
  );
}
