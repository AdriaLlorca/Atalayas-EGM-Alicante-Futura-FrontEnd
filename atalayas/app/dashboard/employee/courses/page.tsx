'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Course {
    id: string;
    title: string;
    isPublic: boolean;
    category: string;
}

export default function EmployeeCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'BASICO' | 'ESPECIALIZADO'>('BASICO');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const fromTaskId = searchParams.get('fromTask');

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const headers = { Authorization: `Bearer ${getToken()}` };
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, { headers });
                const data = await res.json();
                const finalData = Array.isArray(data) ? data : (data.courses || []);
                setCourses(finalData);
            } catch (err) {
                console.error("Error cargando cursos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

  useEffect(() => {
  const autoConfirmTask = async () => {
    if (fromTaskId) {
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
        console.error("Error al autocompletar:", err);
      }
    }
  };

  autoConfirmTask();
}, [fromTaskId]);

    const toggleMenu = (id: string) => setActiveMenu(activeMenu === id ? null : id);

    const filtered = courses.filter(c =>
        activeTab === 'BASICO'
            ? (c.category?.toUpperCase() !== 'ESPECIALIZADO')
            : (c.category?.toUpperCase() === 'ESPECIALIZADO')
    );


    return (
        <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'-apple-system', sans-serif" }}>
            <Sidebar role="EMPLOYEE" />

            <main className="flex-1 p-10 overflow-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">Mi Formación</h1>
                    <p className="text-[#86868b] text-base">Accede a tus contenidos y material de estudio.</p>
                </div>

                {/* Tabs Consistentes */}
                <div className="flex gap-8 border-b border-gray-200 mb-8">
                    {['BASICO', 'ESPECIALIZADO'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 text-sm font-semibold cursor-pointer transition-all ${activeTab === tab ? 'border-b-2 border-[#0071e3] text-[#0071e3]' : 'text-[#86868b] hover:text-[#1d1d1f]'
                                }`}
                        >
                            {tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-200" />)
                        : filtered.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between group hover:shadow-md transition-all relative">

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${activeTab === 'BASICO' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {activeTab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                        </span>

                                        {/* MENÚ DE TRES PUNTOS RESTAURADO */}
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleMenu(course.id)}
                                                className="p-1 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                                    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                                </svg>
                                            </button>

                                            {activeMenu === course.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                    <button className="w-full text-left cursor-pointer px-4 py-3 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] flex items-center gap-2 transition-colors">
                                                        <span>📥</span> Descargar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${activeTab === 'BASICO' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                        {activeTab === 'BASICO' ? '📖' : '🎓'}
                                    </div>
                                    <h3 className="text-[#1d1d1f] font-semibold text-lg leading-tight mb-4">{course.title}</h3>
                                </div>

                                <Link
                                    key={course.id}
                                    href={`/dashboard/employee/courses/${course.id}`} // Corregido: ${course.id}
                                    className="w-full py-2.5 bg-[#0071e3] text-white cursor-pointer text-sm font-medium rounded-xl text-center hover:bg-[#0077ed] transition-colors shadow-sm inline-block"
                                >
                                    Ver
                                </Link>
                            </div>
                        ))}
                </div>
            </main>

            {/* Backdrop para cerrar el menú */}
            {activeMenu && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}
        </div>
    );
}