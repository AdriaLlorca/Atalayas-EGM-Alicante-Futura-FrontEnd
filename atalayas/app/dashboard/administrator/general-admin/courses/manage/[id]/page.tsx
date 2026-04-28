'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [companies, setCompanies] = useState<any[]>([]);

    // Estados para el Buscador de Empresas
    const [companySearch, setCompanySearch] = useState('');
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const [companyError, setCompanyError] = useState(false);

    // NUEVO: Estado para el error del título
    const [titleError, setTitleError] = useState(false);

    const companyRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO',
        companyId: '',
        file: null as File | null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");

                const [resCourse, resCompanies] = await Promise.all([
                    fetch(`${baseUrl}/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(API_ROUTES.COMPANIES.GET_ALL, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const courseData = await resCourse.json();
                const companiesData = await resCompanies.json();
                const allCompanies = Array.isArray(companiesData) ? companiesData : [];

                setCompanies(allCompanies);

                if (resCourse.ok) {
                    setFormData({
                        title: courseData.title || '',
                        isPublic: courseData.isPublic || false,
                        category: courseData.category?.toUpperCase() === 'ESPECIALIZADO' ? 'ESPECIALIZADO' : 'BASICO',
                        companyId: courseData.companyId || '',
                        file: null
                    });

                    if (courseData.companyId) {
                        const currentComp = allCompanies.find(c => c.id === courseData.companyId);
                        if (currentComp) setCompanySearch(currentComp.name);
                    }
                } else {
                    router.push('/dashboard/administrator/general-admin/courses/manage');
                }
            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setFetching(false);
            }
        };

        if (courseId) fetchData();

        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [courseId, router]);

    const filteredCompanies = companies.filter(comp =>
        comp.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let hasError = false;

        // VALIDACIÓN DE TÍTULO
        if (!formData.title.trim()) {
            setTitleError(true);
            hasError = true;
        }

        // VALIDACIÓN DE EMPRESA (Si es privado)
        if (!formData.isPublic && !formData.companyId) {
            setCompanyError(true);
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");

            const payload = {
                title: formData.title.trim(),
                isPublic: formData.isPublic,
                category: formData.category,
                companyId: formData.isPublic ? null : formData.companyId,
                fileUrl: formData.file ? formData.file.name : null,
            };

            const res = await fetch(`${baseUrl}/${courseId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/dashboard/administrator/general-admin/courses/manage');
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
            <Sidebar role="GENERAL_ADMIN" />

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
                        <p className="text-[#86868b] mt-2">
                            {formData.isPublic
                                ? 'Gestionando contenido maestro disponible para todas las empresas.'
                                : 'Modifica los detalles del contenido para la empresa seleccionada.'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">

                        {/* 1. SECCIÓN EMPRESA */}
                        {!formData.isPublic ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500" ref={companyRef}>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Empresa Propietaria</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 outline-none font-bold text-[#1d1d1f] transition-all ${companyError ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-[#0071e3]'}`}
                                        placeholder="Escribe para buscar empresa..."
                                        value={companySearch}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCompanySearch(val);
                                            setIsCompanyListOpen(true);
                                            setCompanyError(false);
                                            const match = companies.find(c => c.name.toLowerCase() === val.toLowerCase());
                                            setFormData(prev => ({ ...prev, companyId: match ? match.id : '' }));
                                        }}
                                        onFocus={() => setIsCompanyListOpen(true)}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                                        <i className={`bi ${isCompanyListOpen ? 'bi-search' : 'bi-building'}`}></i>
                                    </div>

                                    {companyError && (
                                        <p className="text-red-500 text-[10px] font-bold mt-2 ml-2">
                                            <i className="bi bi-exclamation-triangle-fill"></i> Error: Debes seleccionar una empresa de la lista desplegable
                                        </p>
                                    )}

                                    {isCompanyListOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            {filteredCompanies.length > 0 ? (
                                                filteredCompanies.map(comp => (
                                                    <div
                                                        key={comp.id}
                                                        className={`px-6 py-4 hover:bg-[#f5f5f7] cursor-pointer text-sm font-semibold transition-colors ${formData.companyId === comp.id ? 'text-[#0071e3] bg-blue-50' : 'text-[#1d1d1f]'}`}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, companyId: comp.id }));
                                                            setCompanySearch(comp.name);
                                                            setIsCompanyListOpen(false);
                                                            setCompanyError(false);
                                                        }}
                                                    >
                                                        {comp.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-6 py-8 text-center text-[#86868b] text-sm italic">No se encontraron empresas</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95 duration-500">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#0071e3] text-xl">
                                    <i className="bi bi-globe"></i>
                                </div>
                                <div>
                                    <h3 className="text-[#0071e3] font-bold text-sm uppercase tracking-wider">Curso Maestro / Público</h3>
                                    <p className="text-blue-600/70 text-xs font-medium">Contenido universal accesible para todas las organizaciones.</p>
                                </div>
                            </div>
                        )}

                        {/* 2. TÍTULO DEL CURSO (CON VALIDACIÓN) */}
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
                            />
                            {titleError && (
                                <p className="text-red-500 text-[10px] font-bold mt-2 ml-2">
                                    <i className="bi bi-exclamation-triangle-fill"></i> Error: El nombre del curso es obligatorio
                                </p>
                            )}
                        </div>

                        {/* 3. CATEGORÍA */}
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

                        {/* 4. ARCHIVO PDF */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Material PDF</label>
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

                        {/* 5. BOTÓN DE ACCIÓN */}
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