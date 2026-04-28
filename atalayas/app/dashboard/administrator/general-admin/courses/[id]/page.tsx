'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

export default function GAdminCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  const filteredContents = course?.Content?.filter((c: any) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: any, b: any) => a.order - b.order) || [];

  const handleDelete = async () => {
    if (!selectedContent) return;
    setDeletingId(selectedContent.id);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ROUTES.CONTENT.GET_BY_ID(selectedContent.id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse((prev: any) => ({
        ...prev,
        Content: prev.Content.filter((c: any) => c.id !== selectedContent.id),
      }));
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedContent(null);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* Breadcrumb */}
          <Link href="/dashboard/administrator/general-admin/courses" className="inline-flex items-center gap-2 text-[#0071e3] text-sm font-medium hover:underline mb-8 group">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver a todos los cursos
          </Link>

          {/* Header con info de empresa destacada */}
          <div className="bg-white rounded-[28px] border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">📚</div>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${course?.isPublic ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#0071e3]'}`}>
                      {course?.isPublic ? '🌐 Público' : '🔒 Privado'}
                    </span>
                    {course?.Company?.name && (
                      <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                        🏭 {course.Company.name}
                      </span>
                    )}
                    {course?.category && (
                      <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gray-100 text-[#86868b]">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight mb-1">{course?.title}</h1>
                  <p className="text-[#86868b] text-sm">{filteredContents.length} lecciones · Admin General</p>
                </div>
              </div>
              <Link
                href={`/dashboard/administrator/general-admin/courses/${id}/content/new`}
                className="shrink-0 bg-[#1d1d1f] text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
              >
                <span className="text-lg">+</span> Nueva lección
              </Link>
            </div>
          </div>

          {/* Buscador */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1d1d1f]">Lecciones</h2>
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar lección..." />
          </div>

          {/* Lista */}
          {filteredContents.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-dashed border-gray-300 p-16 text-center">
              <p className="text-4xl mb-4">📝</p>
              <p className="text-[#1d1d1f] font-bold mb-2">Sin lecciones todavía</p>
              <Link href={`/dashboard/administrator/general-admin/courses/${id}/content/new`} className="inline-block bg-[#0071e3] text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-[#0077ed] transition-all mt-4">
                Crear primera lección
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContents.map((content: any) => (
                <div
                  key={content.id}
                  onClick={() => router.push(`/dashboard/administrator/general-admin/courses/${id}/content/${content.id}`)}
                  className="bg-white rounded-[20px] border border-gray-200 p-5 hover:border-[#0071e3] hover:shadow-md transition-all cursor-pointer group flex items-center gap-5"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-mono text-sm font-bold text-[#86868b] shrink-0 group-hover:bg-blue-50 group-hover:text-[#0071e3] transition-colors">
                    {String(content.order).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors truncate mb-1">{content.title}</p>
                    <p className="text-xs text-[#86868b] truncate">{content.summary || 'Sin resumen'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {content.url && <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg">PDF</span>}
                    {content.quiz && <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-lg">QUIZ</span>}
                    {content.podcast && <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-lg">AUDIO</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/administrator/general-admin/courses/${id}/content/${content.id}/edit`); }}
                      className="p-2 rounded-xl hover:bg-blue-50 text-[#86868b] hover:text-[#0071e3] transition-all"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedContent(content); setShowDeleteModal(true); }}
                      className="p-2 rounded-xl hover:bg-red-50 text-[#86868b] hover:text-red-500 transition-all"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-gray-300 group-hover:text-[#0071e3] transition-colors shrink-0">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total lecciones', value: course?.Content?.length || 0, bg: 'bg-blue-50', text: 'text-blue-600' },
              { label: 'Con Resumen por IA', value: course?.Content?.filter((c: any) => c.summary)?.length || 0, bg: 'bg-orange-50', text: 'text-orange-600' },
              { label: 'Con Quiz por IA', value: course?.Content?.filter((c: any) => c.quiz)?.length || 0, bg: 'bg-purple-50', text: 'text-purple-600' },
              { label: 'Con Podcast por IA', value: course?.Content?.filter((c: any) => c.podcast)?.length || 0, bg: 'bg-green-50', text: 'text-green-600' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-[20px] p-5`}>
                <p className={`text-2xl font-black ${stat.text} mb-1`}>{stat.value}</p>
                <p className="text-xs font-semibold text-[#86868b]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">🗑️</div>
            <h2 className="text-xl font-black text-[#1d1d1f] text-center mb-2">¿Eliminar lección?</h2>
            <p className="text-sm text-[#86868b] text-center mb-6">Se eliminará <strong>"{selectedContent?.title}"</strong> permanentemente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={!!deletingId} className="w-full py-3.5 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">{deletingId ? 'Eliminando...' : 'Eliminar'}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3.5 rounded-2xl font-semibold text-[#86868b] hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}