'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import SearchInput from '@/components/ui/Searchbar'; // Asegúrate de que la ruta sea correcta
import { API_ROUTES } from '@/lib/utils';

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id; 

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error en la respuesta");
        const data = await res.json();
        const finalData = data.course || data.data || data;
        setCourse(finalData);
      } catch (err) { 
        console.error("Error cargando curso:", err);
        setError(true);
      } finally { 
        setLoading(false); 
      }
    };
    fetchCourseData();
  }, [id]);

  // Lógica de filtrado por búsqueda
  const contentList = course?.Content || course?.content || [];
  
  const filteredContent = contentList.filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ordenamos por el campo 'order'
  const sortedContent = [...filteredContent].sort((a, b) => a.order - b.order);

  if (error) return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
       <Sidebar role="EMPLOYEE" />
       <main className="flex-1 p-10 text-red-500 font-bold">Error al cargar el curso.</main>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />
      
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          
          {/* HEADER CON BUSCADOR */}
          <div className="mb-10">
            <Link href="/dashboard/employee/courses" className="text-[#0071e3] text-sm font-bold hover:underline mb-6 inline-block">
              ← Mis cursos
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight">
                  {loading ? "Cargando..." : course?.title}
                </h1>
                {!loading && (
                  <span className="inline-block mt-2 bg-blue-50 text-[#005596] text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {contentList.length} Lecciones
                  </span>
                )}
              </div>
              <SearchInput 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder='Buscar lección...' 
              />
            </div>
          </div>

          {loading ? (
            /* ESQUELETOS DE CARGA */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {sortedContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedContent.map((content: any) => (
                    <Link 
                      key={content.id} 
                      href={`/dashboard/employee/courses/${id}/content/${content.id}`}
                    >
                      <div className="group bg-white rounded-[2rem] border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-[0.98]">
                        
                        {/* IMAGEN DE LA LECCIÓN */}
                        <div className="relative w-full aspect-video overflow-hidden bg-gray-100 border-b border-gray-50">
                          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-[#1d1d1f] shadow-sm">
                            {content.order}
                          </div>
                          {content.imageUrl ? (
                            <img
                              src={content.imageUrl}
                              alt={content.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              📚
                            </div>
                          )}
                        </div>

                        {/* INFO DE LA LECCIÓN */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-[#1d1d1f] mb-2 group-hover:text-[#0071e3] transition-colors line-clamp-2 h-14 overflow-hidden">
                            {content.title}
                          </h3>
                          
                          <p className="text-sm text-[#86868b] line-clamp-2 mb-4">
                            {content.summary || "Sin descripción disponible."}
                          </p>

                          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                              Lección {content.order}
                            </span>
                            <span className="text-[#0071e3] font-bold text-xs group-hover:translate-x-1 transition-transform">
                              Empezar →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* ESTADO VACÍO */
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <div className="text-4xl mb-4">🔍</div>
                  <h2 className="text-xl font-bold text-[#1d1d1f]">No encontramos lecciones</h2>
                  <p className="text-[#86868b]">Intenta con otro término de búsqueda.</p>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}