"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import SearchInput from "@/components/ui/Searchbar";

export default function AdminCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  const contentList = course?.Content || course?.content || [];

  const filteredContents = contentList
    .filter((c: any) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a: any, b: any) => a.order - b.order);

 if (loading) {
     return (
       <div
         className="flex min-h-screen bg-[#f5f5f7]"
         style={{
           fontFamily:
             "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
         }}
       >
         <Sidebar role="ADMIN" />
 
         <div className="flex-1 flex flex-col items-center justify-center">
           <div className="relative flex items-center justify-center">
             {/* Círculo exterior giratorio */}
 
             <div className="w-16 h-16 border-4 border-[#005596]/10 border-t-[#005596] rounded-full animate-spin"></div>
 
             {/* Punto central */}
 
             <div className="absolute w-4 h-4 bg-[#d9ff00] rounded-full shadow-[0_0_15px_rgba(217,255,0,0.8)]"></div>
           </div>
 
           <p className="mt-6 text-[#005596] font-black text-xs uppercase tracking-[0.3em] animate-pulse">
             Cargando datos...
           </p>
         </div>
       </div>
     );
   }

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f7]"
      style={{
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
          {/* BREADCRUMB */}
          <Link
            href="/dashboard/administrator/admin/courses"
            className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
          >
            <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
            <span>Volver a Cursos</span> {/* Opcional: añadir texto mejora el SEO y accesibilidad */}
          </Link>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-black text-[#005596] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Moderación de Contenidos
              </span>
              <h1 className="text-4xl font-black text-[#1d1d1f] mt-2 tracking-tight">
                {course?.title}
              </h1>
              <p className="text-[#86868b] mt-1">
                Gestiona las lecciones, cuestionarios y material multimedia.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar lección..."
              />
              <Link
                href={`/dashboard/administrator/admin/courses/${id}/content/new`}
                className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0077ed] transition-all shadow-md shrink-0 text-center"
              >
                Añadir Lección
              </Link>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">
                Categoría
              </p>
              <p className="text-lg font-bold text-[#1d1d1f]">
                {course?.category}
              </p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">
                Total Contenidos
              </p>
              <p className="text-lg font-bold text-[#1d1d1f]">
                {contentList.length} Unidades
              </p>
            </div>
          </div>

          {/* TABLA ESTILO APPLE */}
          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-b border-gray-100">
                    <th className="px-8 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest w-16">
                      Orden
                    </th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest">
                      Título de la Lección
                    </th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest">
                      Multimedia
                    </th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContents.length > 0 ? (
                    filteredContents.map((content: any) => (
                      <tr
                        key={content.id}
                        // CLICK EN TODA LA FILA PARA IR AL DETALLE
                        onClick={() =>
                          router.push(
                            `/dashboard/administrator/admin/courses/${id}/content/${content.id}`,
                          )
                        }
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-5 font-mono text-sm text-[#86868b]">
                          {String(content.order).padStart(2, "0")}
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                            {content.title}
                          </div>
                          <div className="text-[11px] text-[#86868b] line-clamp-1 max-w-xs">
                            {content.summary || "Sin resumen"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            {content.quiz && (
                              <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                QUIZ
                              </span>
                            )}
                            {content.podcast && (
                              <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                AUDIO
                              </span>
                            )}
                            {content.url && (
                              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                PORTADA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que se dispare el click de la fila
                                router.push(
                                  `/dashboard/administrator/admin/courses/${id}/content/${content.id}/edit`,
                                );
                              }}
                              className="text-[#0071e3] text-xs font-bold hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-500 text-xs font-bold hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="text-[#86868b] font-medium">
                          Este curso aún no tiene lecciones creadas.
                        </div>
                        <Link
                          href={`/dashboard/administrator/admin/courses/${id}/content/new`}
                          className="text-[#0071e3] text-sm font-bold mt-2 inline-block hover:underline"
                        >
                          Crear la primera lección ahora
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
