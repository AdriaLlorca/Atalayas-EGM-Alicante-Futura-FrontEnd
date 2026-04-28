'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);

    // Estados para el Selector de Empresas
    const [companySearch, setCompanySearch] = useState('');
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const [companyError, setCompanyError] = useState(false);

    // NUEVO: Estado para el error del título
    const [titleError, setTitleError] = useState(false);

    const companyRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO' as 'BASICO' | 'ESPECIALIZADO',
        selectedCompanyId: null as string | null,
        file: null as File | null,
    });

    useEffect(() => {
        fetchCompanies();
        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando empresas:", err);
        }
    };

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
        if (!formData.isPublic && !formData.selectedCompanyId) {
            setCompanyError(true);
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title: formData.title.trim(),
                isPublic: formData.isPublic,
                category: formData.category,
                companyId: formData.isPublic ? null : formData.selectedCompanyId,
                fileUrl: formData.file ? formData.file.name : null,
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
            router.push('/dashboard/administrator/general-admin/courses/manage');
        } catch (err) {
            console.error(err);
            alert("Error al crear el curso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f5f5f7]">
            <Sidebar role="GENERAL_ADMIN" />

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
                        <p className="text-[#86868b] mt-2">Configura un nuevo curso global o específico para una empresa.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">

                        {/* SECCIÓN VISIBILIDAD */}
                        <div className={`p-6 rounded-[2rem] flex items-center justify-between transition-all duration-500 ${formData.isPublic ? 'bg-blue-50 border border-blue-100' : 'bg-[#f5f5f7] border border-transparent'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-xl transition-colors ${formData.isPublic ? 'bg-white text-[#0071e3]' : 'bg-white text-gray-400'}`}>
                                    <i className={`bi ${formData.isPublic ? 'bi-globe' : 'bi-lock-fill'}`}></i>
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm uppercase tracking-wider ${formData.isPublic ? 'text-[#0071e3]' : 'text-gray-500'}`}>
                                        {formData.isPublic ? 'Curso Público' : 'Curso Privado'}
                                    </h3>
                                    <p className="text-[#86868b] text-xs font-medium">
                                        {formData.isPublic ? 'Accesible para todas las empresas.' : 'Solo visible para la empresa seleccionada.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, isPublic: !formData.isPublic, selectedCompanyId: null } as any);
                                    setCompanySearch('');
                                    setCompanyError(false);
                                }}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${formData.isPublic ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* SELECTOR DE EMPRESA */}
                        {!formData.isPublic && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500" ref={companyRef}>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Empresa Propietaria</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escribe para buscar empresa..."
                                        value={companySearch}
                                        onFocus={() => setIsCompanyListOpen(true)}
                                        onChange={(e) => {
                                            setCompanySearch(e.target.value);
                                            setCompanyError(false);
                                            const match = companies.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                                            if (match) setFormData(prev => ({ ...prev, selectedCompanyId: match.id }));
                                            else if (formData.selectedCompanyId) setFormData(prev => ({ ...prev, selectedCompanyId: null }));
                                        }}
                                        className={`w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 outline-none font-bold text-[#1d1d1f] transition-all ${companyError ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-[#0071e3]'}`}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                                        <i className={`bi ${isCompanyListOpen ? 'bi-search' : 'bi-building'}`}></i>
                                    </div>
                                    {companyError && (
                                        <p className="text-red-500 text-[10px] font-bold mt-2 ml-2"><i className="bi bi-exclamation-triangle-fill"></i> Error: Debes seleccionar una empresa de la lista</p>
                                    )}
                                    {isCompanyListOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            {filteredCompanies.length > 0 ? (
                                                filteredCompanies.map(comp => (
                                                    <div
                                                        key={comp.id}
                                                        className={`px-6 py-4 hover:bg-[#f5f5f7] cursor-pointer text-sm font-semibold transition-colors ${formData.selectedCompanyId === comp.id ? 'text-[#0071e3] bg-blue-50' : 'text-[#1d1d1f]'}`}
                                                        onClick={() => {
                                                            setFormData({ ...formData, selectedCompanyId: comp.id });
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
                        )}

                        {/* NOMBRE DEL CURSO (CON VALIDACIÓN DE ERROR) */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Nombre del Curso</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (titleError) setTitleError(false); // Limpiar error al escribir
                                }}
                                className={`w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 outline-none font-bold text-[#1d1d1f] transition-all ${titleError ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-[#0071e3]'}`}
                                placeholder="Título del curso..."
                            />
                            {titleError && (
                                <p className="text-red-500 text-[10px] font-bold mt-2 ml-2"><i className="bi bi-exclamation-triangle-fill"></i> Error: El nombre del curso es obligatorio</p>
                            )}
                        </div>

                        {/* CATEGORÍA */}
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

                        {/* SUBIDA DE PDF */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Material PDF</label>
                            <div className="relative h-28 w-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-[#f5f5f7] hover:border-blue-400 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <p className="font-bold text-[#1d1d1f] px-4 truncate flex items-center">
                                    <i className={`bi ${formData.file ? 'bi-file-earmark-check-fill text-green-500' : 'bi-file-earmark-pdf text-[#0071e3]'} text-xl mr-2 group-hover:scale-110 transition-transform`}></i>
                                    {formData.file ? formData.file.name : 'Subir documento base'}
                                </p>
                            </div>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] cursor-pointer shadow-lg disabled:opacity-50 ${loading ? 'bg-gray-400' : 'bg-[#1d1d1f] hover:bg-black'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="bi bi-arrow-repeat animate-spin"></i> Creando...
                                </span>
                            ) : (
                                'Crear Curso'
                            )}
                        </button>

                    </form>
                </div>
            </main>
        </div>
    );
}