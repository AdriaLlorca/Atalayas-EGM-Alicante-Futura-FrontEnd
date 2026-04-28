'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface User { id: string; name: string; email: string; role: string; companyId: string | null; Company?: { name: string } }
interface Course { id: string; title: string; isPublic: boolean; Company?: { name: string } }
interface BulkResult { enrolled: number; skipped: number; errors: string[] }

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium shadow-xl text-white ${type === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}>
      <i className={`bi ${type === 'ok' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
      {msg}
    </div>
  );
}

export default function BulkEnrollPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [result, setResult] = useState<BulkResult | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setCurrentUser(JSON.parse(saved));

    const fetchData = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const [uRes, cRes] = await Promise.all([
          fetch(API_ROUTES.USERS.GET_ALL, { headers: h }),
          fetch(API_ROUTES.COURSES.GET_ALL, { headers: h }),
        ]);
        const uData = await uRes.json();
        const cData = await cRes.json();
        // Solo empleados para matricular
        setUsers(Array.isArray(uData) ? uData.filter((u: User) => u.role === 'EMPLOYEE' || u.role === 'PUBLIC') : []);
        setCourses(Array.isArray(cData) ? cData : []);
      } catch {
        showToast('Error cargando datos', 'err');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchUser.toLowerCase();
    return users.filter(u =>
      !q || u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchUser]);

  const filteredCourses = useMemo(() => {
    const q = searchCourse.toLowerCase();
    return courses.filter(c => !q || c.title.toLowerCase().includes(q));
  }, [courses, searchCourse]);

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse) { showToast('Selecciona un curso', 'err'); return; }
    if (selectedUsers.size === 0) { showToast('Selecciona al menos un usuario', 'err'); return; }

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(API_ROUTES.ENROLLMENTS.BULK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ userIds: [...selectedUsers], courseId: selectedCourse }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        showToast(`${data.enrolled} usuarios matriculados correctamente`, 'ok');
        setSelectedUsers(new Set());
      } else {
        showToast(data.message || 'Error al matricular', 'err');
      }
    } catch {
      showToast('Error de conexión', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#111113]">
      <Sidebar role={currentUser.role} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-[#86868b] mb-3">
            <Link href="/dashboard/administrator/employees" className="hover:text-[#0071e3] transition-colors">Usuarios</Link>
            <span>/</span>
            <span className="text-[#1d1d1f] dark:text-white">Matriculación masiva</span>
          </nav>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
            Matriculación masiva
          </h1>
          <p className="text-[#86868b] text-sm mt-1">
            Selecciona un curso y los usuarios que quieres matricular de una vez
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Panel izquierdo: curso */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0071e3] text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                Elige un curso
              </h2>
              <div className="relative mb-3">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] text-xs" />
                <input
                  type="text"
                  placeholder="Buscar curso..."
                  value={searchCourse}
                  onChange={e => setSearchCourse(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#f5f5f7] dark:bg-white/5 rounded-xl text-xs outline-none border border-transparent focus:border-[#0071e3] transition-all dark:text-white dark:placeholder:text-[#86868b]"
                />
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : filteredCourses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      selectedCourse === c.id
                        ? 'bg-[#0071e3]/10 border-2 border-[#0071e3]'
                        : 'bg-[#f5f5f7] dark:bg-white/5 border-2 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedCourse === c.id ? 'bg-[#0071e3]' : 'bg-white dark:bg-white/10'}`}>
                      <i className={`bi bi-mortarboard-fill text-sm ${selectedCourse === c.id ? 'text-white' : 'text-[#86868b]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${selectedCourse === c.id ? 'text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white'}`}>
                        {c.title}
                      </p>
                      <p className="text-[10px] text-[#86868b]">{c.Company?.name ?? 'Global'}</p>
                    </div>
                    {selectedCourse === c.id && <i className="bi bi-check-circle-fill text-[#0071e3] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultado */}
            {result && (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-3">Resultado</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: 'Matriculados', value: result.enrolled, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                    { label: 'Ya inscritos', value: result.skipped, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Errores', value: result.errors.length, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                  ].map(r => (
                    <div key={r.label} className={`p-3 rounded-xl ${r.color}`}>
                      <p className="text-xl font-bold">{r.value}</p>
                      <p className="text-[10px] font-medium">{r.label}</p>
                    </div>
                  ))}
                </div>
                {result.errors.length > 0 && (
                  <div className="space-y-1">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-[11px] text-red-600 dark:text-red-400">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel derecho: usuarios */}
          <div className="lg:col-span-3 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#0071e3] text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                  Selecciona usuarios
                  {selectedUsers.size > 0 && (
                    <span className="text-[10px] bg-[#0071e3] text-white px-2 py-0.5 rounded-full font-bold">
                      {selectedUsers.size}
                    </span>
                  )}
                </h2>
                <button
                  onClick={toggleAll}
                  className="text-xs text-[#0071e3] hover:underline font-medium"
                >
                  {selectedUsers.size === filteredUsers.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] text-xs" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#f5f5f7] dark:bg-white/5 rounded-xl text-xs outline-none border border-transparent focus:border-[#0071e3] transition-all dark:text-white dark:placeholder:text-[#86868b]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-white/10 rounded" />
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-32" />
                      <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded w-44" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-[#86868b] text-sm">Sin usuarios disponibles</div>
              ) : (
                filteredUsers.map(u => {
                  const checked = selectedUsers.has(u.id);
                  return (
                    <label key={u.id} className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${checked ? 'bg-[#0071e3]/5' : 'hover:bg-[#f5f5f7] dark:hover:bg-white/5'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(u.id)}
                        className="w-4 h-4 rounded accent-[#0071e3] cursor-pointer"
                      />
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-white/10">
                        <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${checked ? 'bg-[#0071e3] text-white' : 'bg-[#0071e3]/10 text-[#0071e3]'}`}>
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1d1d1f] dark:text-white truncate">{u.name || 'Sin nombre'}</p>
                        <p className="text-xs text-[#86868b] truncate">{u.email}</p>
                      </div>
                      <span className="text-[10px] text-[#86868b] shrink-0">{u.Company?.name ?? '—'}</span>
                    </label>
                  );
                })
              )}
            </div>

            {/* Botón de acción */}
            <div className="p-5 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedUsers.size === 0 || !selectedCourse}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin" />
                    Matriculando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-journal-plus" />
                    Matricular {selectedUsers.size > 0 ? `${selectedUsers.size} usuario${selectedUsers.size !== 1 ? 's' : ''}` : ''} {selectedCourse ? 'en el curso' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
