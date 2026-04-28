'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // NUEVO: Estado para el error del título (igual que en general admin)
    const [titleError, setTitleError] = useState(false);

    // Recuperamos el usuario para el companyId
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO',
        file: null as File | null
    });

    // 1. CARGA DE DATOS INICIAL
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");
                const res = await fetch(`${baseUrl}/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.title || '',
                        isPublic: false, // Como es admin, manejamos su propia empresa
                        category: data.category?.toUpperCase() === 'ESPECIALIZADO' ? 'ESPECIALIZADO' : 'BASICO',
                        file: null
                    });
                } else {
                    router.push('/dashboard/administrator/admin/courses/manage');
                }
            } catch (err) {
                console.error("Error al cargar:", err);
            } finally {
                setFetching(false);
            }
        };

        if (courseId) fetchCourseData();
    }, [courseId, router]);

    // 2. ENVÍO DE DATOS
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // VALIDACIÓN DE TÍTULO (Igual que general admin)
        if (!formData.title.trim()) {
            setTitleError(true);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");
            const targetUrl = `${baseUrl}/${courseId}`;

            const payload = {
                title: formData.title.trim(),
                isPublic: false,
                category: formData.category,
                fileUrl: formData.file ? formData.file.name : null,
                companyId: user.companyId || null
            };

            const res = await fetch(targetUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                window.location.href = '/dashboard/administrator/admin/courses/manage';
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error al guardar: " + (errorData.message || "Error del servidor"));
                setLoading(false);
            }
        } catch (err) {
            alert("Error de conexión.");
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex min-h-screen bg-[#f5f5f7] items-center justify-center">
            <div className="font-bold text-[#1d1d1f] animate-pulse">Cargando información...</div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f5f5f7]">
            <Sidebar role="ADMIN" />

            <main className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-10">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-[#0071e3] font-medium mb-4 flex items-center gap-2 hover:underline bg-transparent border-none cursor-pointer"
                        >
                            <i className="bi bi-arrow-left"></i> Volver
                        </button>
                        <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Editar Curso</h1>
                        <p className="text-[#86868b] mt-2">Modifica los detalles del contenido formativo de tu empresa.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">

                        {/* 1. TÍTULO CON VALIDACIÓN ROJA */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Nombre del Curso</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (titleError) setTitleError(false);
                                }}
                                className={`w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 outline-none font-bold text-[#1d1d1f] transition-all ${titleError ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-[#0071e3]'}`}
                                placeholder="Título del curso..."
                            />
                            {titleError && (
                                <p className="text-red-500 text-[10px] font-bold mt-2 ml-2">
                                    <i className="bi bi-exclamation-triangle-fill text-[8px]"></i> Error: El nombre del curso es obligatorio
                                </p>
                            )}
                        </div>

                        {/* 2. CATEGORÍA CON ICONOS */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Tipo de Formación</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'BASICO' })}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all font-bold ${formData.category === 'BASICO' ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-transparent bg-[#f5f5f7] text-[#86868b]'}`}
                                >
                                    <i className="bi bi-book"></i> Onboarding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all font-bold ${formData.category === 'ESPECIALIZADO' ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-transparent bg-[#f5f5f7] text-[#86868b]'}`}
                                >
                                    <i className="bi bi-mortarboard"></i> Especialización
                                </button>
                            </div>
                        </div>

                        {/* 3. MATERIAL PDF CON ICONO */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Material PDF (Opcional)</label>
                            <div className="relative h-28 w-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-[#f5f5f7] hover:border-blue-400 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <p className="font-bold text-[#1d1d1f] px-4 truncate">
                                    <i className="bi bi-file-earmark-pdf text-[#0071e3] mr-2"></i>
                                    {formData.file ? formData.file.name : 'Sustituir documento'}
                                </p>
                            </div>
                        </div>

                        {/* 4. BOTÓN DE ACCIÓN */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#1d1d1f] text-white rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-[0.98] cursor-pointer shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}