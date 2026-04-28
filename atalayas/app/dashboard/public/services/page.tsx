'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

interface Service {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'BOOKING' | 'ANNOUNCEMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Recuperamos el usuario para el Sidebar
  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};
  const role = user.role || 'PUBLIC';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error('Error al cargar servicios');
        
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

 const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

 return (
  <div className="flex min-h-screen bg-[#f5f5f7]">
    <Sidebar role='PUBLIC' />
    
    <main className="flex-1 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Header con Título y Búsqueda en la misma fila */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#86868b] mb-4">
              <Link href="/dashboard/public" className="hover:text-[#0071e3] transition-colors">Dashboard</Link>
              <span className="opacity-50">/</span>
              <span className="text-[#1d1d1f] font-medium">Servicios</span>
            </nav>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Servicios y Recursos
            </h1>
          </div>

          {/* Aquí el buscador desplegable */}
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder='Buscar servicios...'
          />
        </div>

          {/* Grid Principal */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-[#86868b] font-medium">No hay servicios disponibles en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.sort((a, b) => a.title.localeCompare(b.title)).map((service) => {
                return (
                  <Link key={service.id} href={`/dashboard/public/services/${service.id}`}>
                    <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-200/50 shadow-sm hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500 flex flex-col h-full active:scale-95">

                      <h3 className="text-xl font-bold text-[#1d1d1f] mb-3 group-hover:text-[#0071e3] transition-colors leading-tight">
                        {service.title}
                      </h3>

                      <p className="text-[#86868b] text-[15px] leading-relaxed line-clamp-3 mb-8 flex-1">
                        {service.description || 'Sin descripción.'}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${service.isPublic ? 'text-green-600' : 'text-gray-400'}`}>
                          {service.isPublic ? '🌐 Público' : '🔒 Privado'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}