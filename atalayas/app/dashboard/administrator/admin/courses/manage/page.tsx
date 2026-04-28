'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';
import { useRouter } from 'next/navigation';

export default function ManageCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'BASICO' | 'ESPECIALIZADO'>('ALL');

    // ESTADO PARA EL MODAL DE ELIMINACIÓN
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al obtener cursos:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ROUTES.COURSES.GET_ALL}/${courseToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setCourses(courses.filter(c => c.id !== courseToDelete));
                setCourseToDelete(null);
            } else {
                alert("No se pudo eliminar el curso.");
            }
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };

    const filtered = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isNotPublic = c.isPublic === false || c.isPublic === 0;
        let matchesTab = true;
        if (filter === 'BASICO') matchesTab = c.category?.toUpperCase() !== 'ESPECIALIZADO';
        if (filter === 'ESPECIALIZADO') matchesTab = c.category?.toUpperCase() === 'ESPECIALIZADO';
        return matchesSearch && isNotPublic && matchesTab;
    });

    if (!mounted) return <div className="min-h-screen bg-[#f5f5f7]" />;

    return (
        <div className="flex min-h-screen bg-[#f5f5f7] relative">
            <Sidebar role="ADMIN" />

            <main className="flex-1 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto px-8 py-10">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Vista de los Cursos</h1>
                            <p className="text-[#86868b] text-sm">Administra el contenido privado de tu empresa.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar curso..." />
                            <Link
                                href="/dashboard/administrator/admin/courses/manage/new"
                                className="bg-[#0071e3] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#0077ed] transition-all shadow-sm whitespace-nowrap"
                            >
                                Nuevo curso
                            </Link>
                        </div>
                    </div>

                    {/* FILTROS */}
                    <div className="flex items-center gap-3 mb-10">
                        {['ALL', 'BASICO', 'ESPECIALIZADO'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab as any)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filter === tab ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#86868b] border border-gray-200 cursor-pointer hover:bg-[#1d1d1f]'
                                    }`}
                            >
                                {tab === 'ALL' ? 'Todos' : tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                            </button>
                        ))}
                    </div>

                    {/* TABLA */}
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fbfbfd] border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Nombre</th>
                                    {/* CENTRADO DE CABECERA */}
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest text-center">Categoría</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((course) => (
                                    <tr key={course.id} className="group hover:bg-[#fbfbfd] transition-colors">
                                        <td className="px-8 py-5 font-semibold text-[#1d1d1f]">{course.title}</td>

                                        {/* COLUMNA CENTRADA */}
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                {course.category?.toUpperCase() === 'ESPECIALIZADO' ? (
                                                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 uppercase tracking-tight whitespace-nowrap">
                                                        Especialización
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-tight whitespace-nowrap">
                                                        Onboarding
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Link href={`/dashboard/administrator/admin/courses/manage/${course.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg">
                                                    <i className="bi bi-pencil-square text-blue-500 group-hover:scale-110 transition-transform block"></i>
                                                </Link>
                                                <button
                                                    onClick={() => setCourseToDelete(course.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-lg"
                                                >
                                                    <i className="bi bi-trash-fill text-red-400 group-hover:text-red-600 block transition-colors"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filtered.length === 0 && !loading && (
                            <div className="py-20 text-center">
                                <p className="text-[#86868b] font-medium">No se encontraron cursos en esta categoría.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL DE CONFIRMACIÓN */}
            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
                            </div>
                            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">¿Eliminar curso?</h3>
                            <p className="text-[#86868b] text-sm mb-8">
                                Esta acción no se puede deshacer. El curso se borrará permanentemente.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    Eliminar definitivamente
                                </button>
                                <button
                                    onClick={() => setCourseToDelete(null)}
                                    className="w-full py-4 bg-[#f5f5f7] text-[#1d1d1f] rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}