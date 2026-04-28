'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Course {
    id: string;
    title: string;
    isPublic: boolean;
    category: string;
}

export default function PublicCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const headers = { Authorization: `Bearer ${getToken()}` };
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, { headers });
                const data = await res.json();

                // Filtramos para que el usuario público solo vea lo que es isPublic: true
                const allData = Array.isArray(data) ? data : (data.courses || []);
                setCourses(allData.filter((c: Course) => c.isPublic));
            } catch (err) {
                console.error("Error cargando cursos públicos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#0f1117] text-white">
            <Sidebar role="PUBLIC" />

            <main className="flex-1 p-10 overflow-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Explorar Cursos</h1>
                    <p className="text-gray-500 text-base">
                        Contenido abierto para la comunidad del polígono.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-white/3 rounded-3xl border border-dashed border-white/10">
                        <span className="text-4xl mb-4 block">📚</span>
                        <p className="text-gray-400">No hay cursos públicos disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white/3 rounded-2xl p-5 border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                            {course.category || 'Abierto'}
                                        </span>
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Gratis
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                            📚
                                        </div>
                                        <h3 className="text-white font-semibold text-lg leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">Acceso instantáneo para visitantes</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/public/courses/${course.id}`}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all text-center shadow-lg shadow-blue-900/20"
                                >
                                    Comenzar a aprender
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}