'use client';

import { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function GlobalManageCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BASICO' | 'ESPECIALIZADO'>('ALL');
    const [showOnlyPublic, setShowOnlyPublic] = useState(false);

    // Estados para el Selector de Empresas
    const [companySearch, setCompanySearch] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const companyRef = useRef<HTMLDivElement>(null);

    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchInitialData();

        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [resCourses, resCompanies] = await Promise.all([
                fetch(API_ROUTES.COURSES.GET_ALL, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(API_ROUTES.COMPANIES.GET_ALL, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const dataCourses = await resCourses.json();
            const dataCompanies = await resCompanies.json();
            setCourses(Array.isArray(dataCourses) ? dataCourses : []);
            setCompanies(Array.isArray(dataCompanies) ? dataCompanies : []);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/${courseToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCourses(prev => prev.filter(c => c.id !== courseToDelete));
                setCourseToDelete(null);
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error al eliminar: " + (errorData.message || "No se pudo eliminar el curso"));
            }
        } catch (err) {
            console.error("Error delete:", err);
            alert("Error de conexión al intentar eliminar.");
        }
    };

    const getCompanyName = (course: any) => {
        if (course.isPublic) return 'Global / Público';
        if (course.company?.name) return course.company.name;
        const company = companies.find(c => c.id === course.companyId);
        return company ? company.name : 'Sin empresa';
    };

    const filtered = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesCategory = true;
        if (categoryFilter === 'BASICO') matchesCategory = c.category?.toUpperCase() !== 'ESPECIALIZADO';
        if (categoryFilter === 'ESPECIALIZADO') matchesCategory = c.category?.toUpperCase() === 'ESPECIALIZADO';
        const matchesPublic = showOnlyPublic ? (c.isPublic === true || c.isPublic === 1) : true;
        const matchesCompany = selectedCompanyId ? (c.companyId === selectedCompanyId) : true;
        return matchesSearch && matchesCategory && matchesPublic && matchesCompany;
    });

    const filteredCompanies = companies.filter(comp =>
        comp.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    if (!mounted) return <div className="min-h-screen bg-[#f5f5f7]" />;

    return (
        <div className="flex min-h-screen bg-[#f5f5f7] relative">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto px-8 py-10">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Gestión Global de Cursos</h1>
                            <p className="text-[#86868b] text-sm">Control de contenidos para {companies.length} empresas.</p>
                        </div>
                        <Link
                            href="/dashboard/administrator/general-admin/courses/manage/new"
                            className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ed] transition-all shadow-sm text-center"
                        >
                            Nuevo curso
                        </Link>
                    </div>

                    {/* BARRA DE FILTROS */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-10 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* BUSCAR POR TÍTULO (Ahora igual que el de empresa) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#86868b] uppercase ml-2">Buscar Curso</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-[#f5f5f7] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none font-medium"
                                        placeholder="Título del curso..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* FILTRAR POR EMPRESA */}
                            <div className="flex flex-col gap-2" ref={companyRef}>
                                <label className="text-[11px] font-bold text-[#86868b] uppercase ml-2">Filtrar por Empresa</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-[#f5f5f7] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none font-medium"
                                        placeholder="Escribe nombre de empresa..."
                                        value={companySearch}
                                        onChange={(e) => {
                                            setCompanySearch(e.target.value);
                                            setIsCompanyListOpen(true);
                                            if (e.target.value === '') setSelectedCompanyId(null);
                                        }}
                                        onFocus={() => setIsCompanyListOpen(true)}
                                    />
                                    {isCompanyListOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                            <div
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-bold text-[#0071e3] border-b border-gray-50"
                                                onClick={() => {
                                                    setSelectedCompanyId(null);
                                                    setCompanySearch('');
                                                    setIsCompanyListOpen(false);
                                                }}
                                            >
                                                Mostrar todas las empresas
                                            </div>
                                            {filteredCompanies.map(comp => (
                                                <div
                                                    key={comp.id}
                                                    className={`px-4 py-2 hover:bg-[#f5f5f7] cursor-pointer text-sm ${selectedCompanyId === comp.id ? 'bg-blue-50 text-[#0071e3] font-bold' : ''}`}
                                                    onClick={() => {
                                                        setSelectedCompanyId(comp.id);
                                                        setCompanySearch(comp.name);
                                                        setIsCompanyListOpen(false);
                                                    }}
                                                >
                                                    {comp.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#86868b] uppercase ml-2">Categoría y Visibilidad</label>
                                <div className="flex gap-2">
                                    <div className="bg-[#f5f5f7] p-1 rounded-xl flex flex-1">
                                        {(['ALL', 'BASICO', 'ESPECIALIZADO'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setCategoryFilter(t)}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${categoryFilter === t ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                                            >
                                                {t === 'ALL' ? 'Todos' : t === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowOnlyPublic(!showOnlyPublic)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${showOnlyPublic ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-[#86868b]'}`}
                                    >
                                        {showOnlyPublic ? '✓ Públicos' : 'Públicos'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLA */}
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fbfbfd] border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest w-1/3">Curso</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest text-center">Empresa / Visibilidad</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest text-center">Categoría</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#86868b] uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((course) => (
                                    <tr key={course.id} className="group hover:bg-[#fbfbfd] transition-colors">
                                        <td className="px-8 py-5 font-semibold text-[#1d1d1f]">{course.title}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${course.isPublic ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-[#424245]'}`}>
                                                {getCompanyName(course)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'Especialización' : 'Onboarding'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/dashboard/administrator/general-admin/courses/manage/${course.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                                                    <i className="bi bi-pencil-square text-blue-500 group-hover:scale-110 transition-transform block"></i>
                                                </Link>
                                                <button onClick={() => setCourseToDelete(course.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group cursor-pointer border-none bg-transparent">
                                                    <i className="bi bi-trash-fill text-red-400 group-hover:text-red-600 block transition-colors"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filtered.length === 0 && !loading && (
                            <div className="py-20 text-center flex flex-col items-center gap-2">
                                <i className="bi bi-search text-3xl text-gray-200"></i>
                                <p className="text-[#86868b] font-medium">No se encontraron cursos.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCategoryFilter('ALL');
                                        setShowOnlyPublic(false);
                                        setSelectedCompanyId(null);
                                        setCompanySearch('');
                                    }}
                                    className="text-[#0071e3] text-sm hover:underline mt-2"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL DE CONFIRMACIÓN */}
            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">¿Eliminar curso?</h3>
                        <p className="text-[#86868b] text-sm mb-8">Esta acción no se puede deshacer. El curso se borrará de forma permanente.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors cursor-pointer active:scale-95"
                            >
                                Eliminar definitivamente
                            </button>
                            <button
                                onClick={() => setCourseToDelete(null)}
                                className="w-full py-4 bg-[#f5f5f7] text-[#1d1d1f] rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer active:scale-95"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}