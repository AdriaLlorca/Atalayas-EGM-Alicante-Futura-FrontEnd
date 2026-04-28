'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';

interface Colaborador {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  type: string;
}

export default function EcosystemPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    const fetchEcosystem = async () => {
      try {
        // Sustituir por tu llamada real a la API
        // const res = await fetch(API_ROUTES.ECOSYSTEM.GET_ALL);
        // const data = await res.json();
        
    const mockData = [
  // UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN
  {
    id: 'eco-1',
    name: 'UNIVERSIDAD DE ALICANTE',
    type: 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN',
    description: 'Universidad pública con una fuerte vocación de I+D+i, conexión con empresas y proyectos de transferencia tecnológica.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-ua.png',
    website: 'https://www.ua.es'
  },
  {
    id: 'eco-2',
    name: 'UNIVERSIDAD MIGUEL HERNÁNDEZ DE ELCHE',
    type: 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN',
    description: 'Universidad pública con múltiples programas de innovación, transferencia y colaboración con empresas e instituciones.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-umh.png',
    website: 'https://www.umh.es'
  },

  // PARQUES CIENTÍFICOS
  {
    id: 'eco-3',
    name: 'PARQUE CIENTÍFICO DE ALICANTE',
    type: 'PARQUES CIENTÍFICOS',
    description: 'Ecosistema impulsado por la UA que conecta investigación, empresas y talentos para acelerar la innovación.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-pca.png',
    website: 'https://parquecientificoalicante.es'
  },
  {
    id: 'eco-4',
    name: 'PARQUE CIENTÍFICO DE LA UMH',
    type: 'PARQUES CIENTÍFICOS',
    description: 'Plataforma de la Universidad Miguel Hernández enfocada en la creación y consolidación de empresas innovadoras.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-umhparc.png',
    website: 'https://parquecientificoumh.es'
  },

  // INSTITUTOS Y CENTROS TECNOLÓGICOS
  {
    id: 'eco-5',
    name: 'AIJU INSTITUTO TECNOLÓGICO',
    type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
    description: 'Centro tecnológico especializado en I+D+i para productos infantiles, ocio y sectores industriales vinculados.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-aiju.png',
    website: 'https://www.aiju.es'
  },
  {
    id: 'eco-6',
    name: 'INESCOP INSTITUTO TECNOLÓGICO',
    type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
    description: 'Centro de innovación y tecnología experto en el sector del calzado, con servicios de investigación y competitividad.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-inescop.png',
    website: 'https://www.inescop.es'
  },
  {
    id: 'eco-7',
    name: 'AITEX CENTRO DE INVESTIGACIÓN',
    type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
    description: 'Instituto tecnológico de referencia en investigación aplicada al sector textil y materiales avanzados.',
    logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-aitex.png',
    website: 'https://www.aitex.es'
  }
];
        setColaboradores(mockData);
      } catch (err) {
        console.error("Error cargando ecosistema:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEcosystem();
  }, []);

  const filteredList = filter === 'TODOS' 
    ? colaboradores 
    : colaboradores.filter(c => c.type === filter);

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">Ecosistema de Proximidad</h1>
            <p className="text-[#86868b] font-medium">Gestiona el ecosistema de proximidad de la EGM.</p>
          </div>
        </header>

        {/* FILTROS RÁPIDOS */}
        <div className="flex flex-wrap gap-2 mb-12">
          {['TODOS', 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN', 'PARQUES CIENTÍFICOS', 'INSTITUTOS Y CENTROS TECNOLÓGICOS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${
                filter === cat 
                ? 'bg-[#1d1d1f] text-white shadow-md' 
                : 'bg-white text-[#86868b] border border-gray-200 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CUADRÍCULA DE COLABORADORES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          
          {loading ? (
             <div className="col-span-full text-center py-20 animate-pulse text-gray-400">Cargando ecosistema...</div>
          ) : filteredList.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 text-gray-400 font-medium">
              No hay entidades en esta categoría.
            </div>
          ) : (
            filteredList.map((entidad) => (
              <div key={entidad.id} className="group relative">
                {/* BOTÓN / CARD */}
                <Link href={entidad.website} 
                className="aspect-square bg-white rounded-[2.5rem] border border-gray-200 shadow-sm group-hover:shadow-2xl group-hover:border-blue-300 transition-all duration-500 flex flex-col items-center justify-center p-8 overflow-hidden relative" 
                target="_blank"
                rel="noopener noreferrer">
                  
                  {/* LOGO */}
                  <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-90">
                    {entidad.logoUrl ? (
                      <img 
                        src={entidad.logoUrl} 
                        alt={entidad.name} 
                        className="max-w-full max-h-full group-hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="text-5xl font-black text-gray-100 uppercase">{entidad.name.charAt(0)}</div>
                    )}
                  </div>
                </Link>
                
                {/* NOMBRE DEBAJO */}
                <p className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-[#1d1d1f] group-hover:text-blue-600 transition-colors truncate">
                  {entidad.name}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}