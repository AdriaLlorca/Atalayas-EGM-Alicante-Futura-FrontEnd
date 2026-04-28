'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  activity: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  logoUrl: string | null;
  cif: string | null;
  createdAt: string;
  website: string | null;
  User?: { id: string }[];
}

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : '';

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium shadow-xl text-white ${type === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}>
      <i className={`bi ${type === 'ok' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
      {msg}
    </div>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const user = JSON.parse(saved);
    if (user.role !== 'GENERAL_ADMIN') { router.push('/dashboard'); return; }
    setCurrentUser(user);

    fetch(API_ROUTES.COMPANIES.GET_ALL, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(d => setCompanies(Array.isArray(d) ? d : []))
      .catch(() => showToast('Error cargando empresas', 'err'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter(c =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.activity?.toLowerCase().includes(q) ||
      c.cif?.toLowerCase().includes(q)
    );
  }, [companies, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la empresa "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(API_ROUTES.COMPANIES.DELETE(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== id));
        showToast('Empresa eliminada', 'ok');
      } else {
        showToast('No se pudo eliminar', 'err');
      }
    } catch {
      showToast('Error de conexión', 'err');
    } finally {
      setDeleting(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#111113]">
      <Sidebar role="GENERAL_ADMIN" />
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
              Empresas
            </h1>
            <p className="text-[#86868b] text-sm mt-1">
              {filtered.length} empresa{filtered.length !== 1 ? 's' : ''} registrada{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/dashboard/company"
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
          >
            <i className="bi bi-building-fill-gear" />
            Gestionar perfiles
          </Link>
        </div>

        {/* Buscador */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 border border-gray-100 dark:border-white/5 mb-5">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] text-sm" />
            <input
              type="text"
              placeholder="Buscar por nombre, sector o CIF..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f7] dark:bg-white/5 dark:text-white rounded-xl text-sm outline-none border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Grid de empresas */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white dark:bg-[#1c1c1e] rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/5 p-16 text-center">
            <i className="bi bi-buildings text-4xl text-[#86868b] block mb-3" />
            <p className="text-[#86868b] text-sm">
              {search ? 'No se encontraron empresas con esa búsqueda' : 'No hay empresas registradas todavía'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(company => (
              <div
                key={company.id}
                className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-sm transition-all group flex flex-col"
              >
                {/* Cabecera */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-white/10 bg-[#f5f5f7] dark:bg-white/5 flex items-center justify-center">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <i className="bi bi-building-fill text-[#86868b] text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#1d1d1f] dark:text-white text-sm truncate">
                      {company.name}
                    </h3>
                    {company.activity && (
                      <p className="text-xs text-[#86868b] truncate mt-0.5">{company.activity}</p>
                    )}
                    {company.cif && (
                      <p className="text-[10px] text-[#86868b] font-mono mt-0.5">{company.cif}</p>
                    )}
                  </div>
                </div>

                {/* Datos */}
                <div className="space-y-2 flex-1 mb-4">
                  {company.contactEmail && (
                    <div className="flex items-center gap-2 text-xs text-[#424245] dark:text-[#ebebf5]">
                      <i className="bi bi-envelope text-[#86868b] shrink-0" />
                      <span className="truncate">{company.contactEmail}</span>
                    </div>
                  )}
                  {company.contactPhone && (
                    <div className="flex items-center gap-2 text-xs text-[#424245] dark:text-[#ebebf5]">
                      <i className="bi bi-telephone text-[#86868b] shrink-0" />
                      <span>{company.contactPhone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2 text-xs text-[#424245] dark:text-[#ebebf5]">
                      <i className="bi bi-geo-alt text-[#86868b] shrink-0" />
                      <span className="truncate">{company.address}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-xs">
                      <i className="bi bi-globe text-[#86868b] shrink-0" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0071e3] hover:underline truncate"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {company.User && (
                    <div className="flex items-center gap-2 text-xs text-[#424245] dark:text-[#ebebf5]">
                      <i className="bi bi-people text-[#86868b] shrink-0" />
                      <span>{company.User.length} usuario{company.User.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Fecha y acciones */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                  <span className="text-[10px] text-[#86868b]">
                    {new Date(company.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(company.id, company.name)}
                    disabled={deleting === company.id}
                    className="opacity-0 group-hover:opacity-100 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white dark:bg-transparent hover:bg-red-50 transition-all disabled:opacity-30"
                  >
                    {deleting === company.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
