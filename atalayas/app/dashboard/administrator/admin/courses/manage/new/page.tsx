'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Estado para validación visual de errores
    const [titleError, setTitleError] = useState(false);

    // Obtener datos del usuario logueado
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

    const [formData, setFormData] = useState({
        title: '',
        category: 'BASICO' as 'BASICO' | 'ESPECIALIZADO',
        file: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validación de Título (Mismo estilo que general-admin)
        if (!formData.title.trim()) {
            setTitleError(true);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const payload = {
                title: formData.title.trim(),
                isPublic: false, // Los cursos creados por admin de empresa son privados por defecto
                category: formData.category,
                fileUrl: formData.file ? formData.file.name : null,
                companyId: user.companyId || null
            };

            const resCourse = await fetch(API_ROUTES.COURSES.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!resCourse.ok) throw new Error("Error al crear el curso");

            // Redirección al listado de cursos del admin
            router.push('/dashboard/administrator/admin/courses');

        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al crear el curso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f5f5f7]">
            <Sidebar role="ADMIN" />

            <main className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-10">
                        <button
                            onClick={() => router.back()}
                            className="text-[#0071e3] font-medium mb-4 flex items-center gap-2 hover:underline bg-transparent border-none cursor-pointer"
                        >
                            <i className="bi bi-arrow-left"></i> Volver
                        </button>
                        <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Nuevo Curso</h1>
                        <p className="text-[#86868b] mt-2">Crea un nuevo contenido formativo para tu organización.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">

                        {/* 1. NOMBRE DEL CURSO CON ERROR VISUAL */}
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
                                disabled={loading}
                            />
                            {titleError && (
                                <p className="text-red-500 text-[10px] font-bold mt-2 ml-2">
                                    <i className="bi bi-exclamation-triangle-fill"></i> Error: El nombre del curso es obligatorio
                                </p>
                            )}
                        </div>

                        {/* 2. CATEGORÍA (CON ICONOS) */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Tipo de Formación</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'BASICO' })}
                                    disabled={loading}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all font-bold ${formData.category === 'BASICO' ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-transparent bg-[#f5f5f7] text-[#86868b]'}`}
                                >
                                    <i className="bi bi-book"></i> Onboarding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                                    disabled={loading}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all font-bold ${formData.category === 'ESPECIALIZADO' ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-transparent bg-[#f5f5f7] text-[#86868b]'}`}
                                >
                                    <i className="bi bi-mortarboard"></i> Especialización
                                </button>
                            </div>
                        </div>

                        {/* 3. SUBIDA DE PDF (ESTILO GRUPO) */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Material de estudio (PDF)</label>
                            <div className="relative h-28 w-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-[#f5f5f7] hover:border-blue-400 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    disabled={loading}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <p className="font-bold text-[#1d1d1f] px-4 truncate flex items-center">
                                    <i className={`bi ${formData.file ? 'bi-file-earmark-check-fill text-green-500' : 'bi-file-earmark-pdf text-[#0071e3]'} text-xl mr-2 group-hover:scale-110 transition-transform`}></i>
                                    {formData.file ? formData.file.name : 'Subir documento base'}
                                </p>
                            </div>
                        </div>

                        {/* BOTÓN SUBMIT (MISMO ESTILO QUE GENERAL ADMIN) */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] cursor-pointer shadow-lg disabled:opacity-50 ${loading ? 'bg-gray-400' : 'bg-[#1d1d1f] hover:bg-black'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="bi bi-arrow-repeat animate-spin"></i> Creando curso...
                                    </span>
                                ) : (
                                    'Crear Curso'
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}