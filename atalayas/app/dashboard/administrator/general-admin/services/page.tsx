'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';
import CompanyDropdown from '@/components/ui/CompanyDropdown';

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
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [companySearch, setCompanySearch] = useState('');
  const router = useRouter();

  // Recuperamos el usuario para el Sidebar
  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};
  const role = user.role || 'GENERAL_ADMIN';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // 1. Filtrado base por búsqueda
  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Agrupación por empresa
  const byCompany = filteredServices.reduce((acc, s) => {
    if (!s.isPublic) {
      const name = s.Company?.name || 'Sin empresa';
      if (!acc[name]) acc[name] = [];
      acc[name].push(s);
    }
    return acc;
  }, {} as Record<string, Service[]>);

  // 3. Preparación de la lista actual
  const companies = ['PUBLIC', ...Object.keys(byCompany)];
  const publicServices = filteredServices.filter(s => s.isPublic);
  
  const currentList = [...(selectedCompany === 'PUBLIC' ? publicServices : byCompany[selectedCompany] || [])];
  
  // 4. Ordenado alfabético (Usando localeCompare que es más robusto)
  currentList.sort((a, b) => a.title.localeCompare(b.title));


  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Forzamos el rol ya que esta es una página de General Admin */}
      <Sidebar role='GENERAL_ADMIN' />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Gestión de Servicios</h1>
              <p className="text-[#86868b] text-sm">Organiza y edita los servicios del ecosistema.</p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar..." />
              <Link href="/dashboard/administrator/general-admin/services/new"
                className="bg-[#0071e3] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#0077ed] transition-all shadow-sm whitespace-nowrap">
                Nuevo servicio
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <CompanyDropdown companies={companies} selected={selectedCompany} onChange={setSelectedCompany} />
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Servicio</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Empresa Propietaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={2} className="px-6 py-8 bg-gray-50/30"></td>
                      </tr>
                    ))
                  ) : currentList.length > 0 ? (
                    currentList.map((service) => (
                      <tr
                        key={service.id}
                        onClick={() => router.push(`/dashboard/administrator/general-admin/services/${service.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                            {service.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${service.isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {service.isPublic ? 'Global (Atalayas)' : (service.Company?.name || 'Privado')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-[#86868b] text-sm">
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