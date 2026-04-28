'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Company { id: string; name: string; }
interface User {
  id: string; email: string; name: string; role: string;
  companyId: string | null; createdAt: string; avatarUrl?: string;
  Company?: Company;
}

const ROLES_ORDER: Record<string, number> = {
  GENERAL_ADMIN: 1, ADMIN: 2, EMPLOYEE: 3, PUBLIC: 4,
};
const ROLE_COLORS: Record<string, string> = {
  GENERAL_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
  PUBLIC: 'bg-gray-100 text-gray-600',
};
const ROLE_LABELS: Record<string, string> = {
  GENERAL_ADMIN: 'Admin General', ADMIN: 'Admin',
  EMPLOYEE: 'Empleado', PUBLIC: 'Público',
};
const PAGE_SIZE = 15;

function exportCSV(users: User[]) {
  const header = 'Nombre,Email,Rol,Empresa,Fecha registro';
  const rows = users.map((u) =>
    [
      u.name || '',
      u.email,
      ROLE_LABELS[u.role] || u.role,
      u.Company?.name || '',
      new Date(u.createdAt).toLocaleDateString('es-ES'),
    ]
      .map((v) => `"${v}"`)
      .join(','),
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (saved) setCurrentUser(JSON.parse(saved));

    const fetchData = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const [uRes, cRes] = await Promise.all([
          fetch(API_ROUTES.USERS.GET_ALL, { headers: h }),
          fetch(API_ROUTES.COMPANIES.GET_ALL, { headers: h }),
        ]);
        const uData = await uRes.json();
        const cData = cRes.ok ? await cRes.json() : [];
        setUsers(Array.isArray(uData) ? uData : []);
        setCompanies(Array.isArray(cData) ? cData : []);
      } catch {
        showToast('Error cargando datos', 'err');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => {
        const matchSearch =
          !q ||
          u.name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q);
        const matchCompany =
          filterCompany === 'ALL' || u.companyId === filterCompany;
        const matchRole = filterRole === 'ALL' || u.role === filterRole;
        return matchSearch && matchCompany && matchRole;
      })
      .sort((a, b) => (ROLES_ORDER[a.role] || 9) - (ROLES_ORDER[b.role] || 9));
  }, [users, search, filterCompany, filterRole]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(API_ROUTES.USERS.DELETE(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast('Usuario eliminado', 'ok');
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
  const isGeneral = currentUser.role === 'GENERAL_ADMIN';

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role={currentUser.role} />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg text-white transition-all ${toast.type === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#1d1d1f] tracking-tight">
              Gestión de usuarios
            </h1>
            <p className="text-[#86868b] text-sm mt-1">
              {filtered.length} usuario{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
            >
              <i className="bi bi-download text-sm" />
              Exportar CSV
            </button>
            <Link
              href="/dashboard/administrator/employees/new"
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
            >
              <i className="bi bi-plus-lg" />
              Nuevo usuario
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] text-sm" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm outline-none border border-transparent focus:border-[#0071e3] focus:bg-white transition-all"
            />
          </div>
          {isGeneral && (
            <select
              value={filterCompany}
              onChange={(e) => { setFilterCompany(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm outline-none border border-transparent focus:border-[#0071e3] min-w-[180px]"
            >
              <option value="ALL">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm outline-none border border-transparent focus:border-[#0071e3] min-w-[140px]"
          >
            <option value="ALL">Todos los roles</option>
            <option value="GENERAL_ADMIN">Admin General</option>
            <option value="ADMIN">Administrador</option>
            <option value="EMPLOYEE">Empleado</option>
            <option value="PUBLIC">Público</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fafafa]">
                <th className="px-5 py-3.5 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                  Rol
                </th>
                {isGeneral && (
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                    Empresa
                  </th>
                )}
                <th className="px-5 py-3.5 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                      </td>
                    </tr>
                  ))
                : paginated.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-[#86868b] text-sm"
                    >
                      No se encontraron usuarios con esos filtros.
                    </td>
                  </tr>
                )
                : paginated.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#fafafa] transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-100">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#0071e3]/10 flex items-center justify-center">
                                <span className="text-[#0071e3] text-xs font-bold">
                                  {(u.name || u.email).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1d1d1f]">
                              {u.name || 'Sin nombre'}
                            </p>
                            <p className="text-xs text-[#86868b]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      {isGeneral && (
                        <td className="px-5 py-3.5 text-sm text-[#424245]">
                          {u.Company?.name || '—'}
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-xs text-[#86868b] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(u.id, u.name || u.email)}
                          disabled={deleting === u.id || u.id === currentUser.id}
                          className="opacity-0 group-hover:opacity-100 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {deleting === u.id ? '...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-[#86868b]">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-[#424245] hover:bg-[#f5f5f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-[#424245] hover:bg-[#f5f5f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
