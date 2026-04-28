'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

interface Service {

  id: string;

  title: string;

  description: string;

  isPublic: boolean;

  Company?: { id: string; name: string };

}



export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('ADMIN');
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'COMPANY'>('COMPANY');


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if(storedUser){
      const parsedUser = JSON.parse(storedUser);
      if(parsedUser.role){
        setRole(parsedUser.role)
      }
    }
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

const searchedServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByCategory = searchedServices.filter(s => {
  if (filter === 'ALL') return true;
  if (filter === 'PUBLIC') return s.isPublic === true;
  if (filter === 'COMPANY') return s.isPublic === false;
  return true;
});

  // 3. Ordenamos: isPublic (false) primero, isPublic (true) después
  const currentList = [...filteredByCategory].sort((a, b) => {
  // Si a no es público (empresa) y b sí lo es, a va primero (-1)
  if (!a.isPublic && b.isPublic) return -1;
  // Si a es público y b no, b va primero (1)
  if (a.isPublic && !b.isPublic) return 1;
  // Si ambos son del mismo tipo, mantenemos orden alfabético por título
  return a.title.localeCompare(b.title);
  });

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role='ADMIN' />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">

          {/* Header Compacto */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Gestión de Servicios</h1>
              <p className="text-[#86868b] text-sm">Organiza y edita los servicios de tu empresa.</p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar..." />
              <Link href="/dashboard/administrator/admin/services/new"
                className="bg-[#0071e3] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#0077ed] transition-all shadow-sm whitespace-nowrap">
                Nuevo servicio
              </Link>
            </div>
          </div>

          {/* CHIPS DE FILTRADO */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {['ALL', 'COMPANY', 'PUBLIC'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === type ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#86868b] border border-gray-200'
                }`}
              >
                {type === 'ALL' ? ( 'Todos')  :
                  type === 'PUBLIC' ? 
                  (<span className="flex items-center gap-2">
                    <i className="bi bi-globe text-green-400"></i> Públicos
                </span>
                )  : 
                <span className='flex items-center gap-2'>
                  <i className="bi bi-building-fill text-blue-400"></i> Mi empresa </span>}
              </button>
            ))}
          </div>

          {/* LISTA MODO TABLA (ESTILO APPLE/STRIPE) */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-bottom border-gray-100">
                    <th className="w-3/5 px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Servicio</th>
                    <th className="w-2/5 px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Empresa Propietaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-8 bg-gray-50/30"></td>
                      </tr>
                    ))
                  ) : currentList.length > 0 ? (
                    currentList.map((service) => (
                      <tr
                        key={service.id}
                        onClick={() => router.push(`/dashboard/administrator/admin/services/${service.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                              {service.title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${service.isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {service.isPublic ? 'Global (Atalayas)' : service.Company?.name}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#86868b] text-sm">
                        No se encontraron servicios en esta categoría.
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