'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

export default function GeneralAdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BASICO' | 'ESPECIALIZADO'>('BASICO');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c => {
    const matchesTab = activeTab === 'BASICO'
      ? (c.category?.toUpperCase() !== 'ESPECIALIZADO')
      : (c.category?.toUpperCase() === 'ESPECIALIZADO');

    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'-apple-system', sans-serif" }}>
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-10 overflow-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Catálogo Maestro</h1>
            <p className="text-[#86868b] mt-1 text-lg">Configura la oferta formativa global del sistema.</p>
          </div>

          <div className="flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder='Buscar cursos...'
            />

            <Link
              href="/dashboard/administrator/general-admin/courses/manage"
              className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0077ed] transition-all shadow-md shrink-0 text-center"
            >
              Vista Global
            </Link>
          </div>
        </div>

        {/* TABS ESTILO APPLE */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          {['BASICO', 'ESPECIALIZADO'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-semibold cursor-pointer transition-all ${activeTab === tab
                ? 'border-b-2 border-[#0071e3] text-[#0071e3]'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
            >
              {tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
            <p className="text-[#86868b] font-medium">No se han encontrado cursos en esta sección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between group hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${activeTab === 'BASICO' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                      {activeTab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                    </span>
                  </div>

                  {/* ICONO BOOTSTRAP CON FONDO CIRCULAR/SUAVE */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${activeTab === 'BASICO' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                    {activeTab === 'BASICO' ? (
                      <i className="bi bi-book"></i>
                    ) : (
                      <i className="bi bi-mortarboard"></i>
                    )}
                  </div>

                  <h3 className="text-[#1d1d1f] font-semibold text-lg leading-tight mb-4 min-h-12 line-clamp-2">
                    {course.title}
                  </h3>
                </div>
                <Link
                  href={`/dashboard/administrator/admin/courses/${course.id}`}
                  className="w-full py-2.5 bg-[#0071e3] text-white text-sm font-medium rounded-xl text-center hover:bg-[#0077ed] transition-colors shadow-sm"
                >
                  Gestionar Curso
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}