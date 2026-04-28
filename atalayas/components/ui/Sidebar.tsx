'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

type NavItem = { label: string; href: string; icon: string; badge?: number };
type NavGroup = { group: string; items: NavItem[] };

const navGroups: Record<string, NavGroup[]> = {
  GENERAL_ADMIN: [
    {
      group: 'General',
      items: [
        { label: 'Panel', href: '/dashboard/administrator/general-admin', icon: 'bi-house-fill' },
        { label: 'Empresas', href: '/dashboard/administrator/general-admin/companies', icon: 'bi-building-fill-gear' },
        { label: 'Usuarios', href: '/dashboard/administrator/employees', icon: 'bi-people-fill' },
      ],
    },
    {
      group: 'Contenido',
      items: [
        { label: 'Cursos', href: '/dashboard/administrator/general-admin/courses', icon: 'bi-mortarboard-fill' },
        { label: 'Servicios', href: '/dashboard/administrator/general-admin/services', icon: 'bi-suitcase-lg-fill' },
        { label: 'Documentos', href: '/dashboard/documents', icon: 'bi-file-earmark-text-fill' },
        { label: 'Matriculación masiva', href: '/dashboard/administrator/bulk-enroll', icon: 'bi-journal-plus' },
      ],
    },
    {
      group: 'Gestión',
      items: [
        { label: 'Estadísticas', href: '/dashboard/administrator/general-admin/stats', icon: 'bi-bar-chart-fill' },
        { label: 'Anuncios', href: '/dashboard/administrator/general-admin/announcements', icon: 'bi-megaphone-fill' },
        { label: 'Solicitudes', href: '/dashboard/administrator/general-admin/company-request', icon: 'bi-envelope-exclamation-fill' },
        { label: 'Perfil empresa', href: '/dashboard/company', icon: 'bi-building-fill-gear' },
        { label: 'Ecosistema', href: '/dashboard/administrator/general-admin/community', icon: 'bi-globe-americas' },
      ],
    },
  ],
  ADMIN: [
    {
      group: 'General',
      items: [
        { label: 'Panel', href: '/dashboard/administrator/admin', icon: 'bi-house-fill' },
        { label: 'Mi Empresa', href: '/dashboard/company', icon: 'bi-building-fill' },
        { label: 'Empleados', href: '/dashboard/administrator/employees', icon: 'bi-people-fill' },
      ],
    },
    {
      group: 'Formación',
      items: [
        { label: 'Cursos', href: '/dashboard/administrator/admin/courses', icon: 'bi-mortarboard-fill' },
        { label: 'Matriculación masiva', href: '/dashboard/administrator/bulk-enroll', icon: 'bi-journal-plus' },
        { label: 'Onboarding', href: '/dashboard/administrator/employees/onboarding', icon: 'bi-person-walking' },
        { label: 'Documentos', href: '/dashboard/documents', icon: 'bi-file-earmark-text-fill' },
      ],
    },
    {
      group: 'Comunicación',
      items: [
        { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: 'bi-suitcase-lg-fill' },
        { label: 'Anuncios', href: '/dashboard/administrator/general-admin/announcements', icon: 'bi-megaphone-fill' },
        { label: 'Mi Empresa', href: '/dashboard/administrator/admin/company', icon: 'bi-building-fill' },
{ label: 'Ecosistema', href: '/dashboard/administrator/general-admin/community', icon: 'bi-globe-americas' },
      ],
    },
  ],
  EMPLOYEE: [
    {
      group: 'Inicio',
      items: [
        { label: 'Inicio', href: '/dashboard/employee', icon: 'bi-house-fill' },
        { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: 'bi-mortarboard-fill' },
      ],
    },
    {
      group: 'Recursos',
      items: [
        { label: 'Documentos', href: '/dashboard/documents', icon: 'bi-file-earmark-text-fill' },
        { label: 'Servicios', href: '/dashboard/employee/services', icon: 'bi-suitcase-lg-fill' },
        { label: 'Ecosistema', href: '/dashboard/employee/community', icon: 'bi-globe-americas' },
      ],
    },
  ],
  PUBLIC: [
    {
      group: 'Explorar',
      items: [
        { label: 'Panel', href: '/dashboard/public', icon: 'bi-house-fill' },
        { label: 'Cursos', href: '/dashboard/public/courses', icon: 'bi-mortarboard-fill' },
        { label: 'Servicios', href: '/dashboard/public/services', icon: 'bi-suitcase-lg-fill' },
      ],
    },
  ],
};

const roleLabels: Record<string, string> = {
  GENERAL_ADMIN: 'Admin General', ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado', PUBLIC: 'Usuario',
};

const roleGradients: Record<string, string> = {
  GENERAL_ADMIN: 'from-violet-500 to-purple-600',
  ADMIN: 'from-blue-500 to-blue-600',
  EMPLOYEE: 'from-emerald-500 to-green-600',
  PUBLIC: 'from-gray-400 to-gray-500',
};

const roleBadgeColors: Record<string, string> = {
  GENERAL_ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  EMPLOYEE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PUBLIC: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDark(savedDark);
    if (savedDark) document.documentElement.classList.add('dark');

    const checkWidth = () => {
      if (window.innerWidth < 1024) setCollapsed(false);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    setMounted(true);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    if (!mounted || role !== 'GENERAL_ADMIN') return;
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetchWithApiFallback(API_ROUTES.COMPANY_REQUESTS.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const pending = Array.isArray(data) ? data.filter((r: any) => r.status === 'PENDING').length : 0;
        setPendingCount(pending);
      } catch {}
    };
    fetchPending();
  }, [role, mounted]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const groups = (navGroups[role] ?? []).map(g => ({
    ...g,
    items: g.items.map(item => {
      if (item.href.includes('company-request') && pendingCount > 0) {
        return { ...item, badge: pendingCount };
      }
      return item;
    }),
  }));

  const allItems = groups.flatMap(g => g.items);
  const filteredItems = search.trim()
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const isDesktopCollapsed = collapsed;
  const isMobileOpen = mobileOpen;

  return (
    <>
      {/* Mobile toggle button */}
      {mounted && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 p-2.5 bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white rounded-xl lg:hidden shadow-md border border-gray-200 dark:border-white/10 transition-all hover:scale-105"
          aria-label="Abrir menú"
        >
          <i className="bi bi-list text-lg leading-none" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          flex flex-col h-screen sticky top-0 z-40
          max-lg:fixed max-lg:inset-y-0 max-lg:left-0
          transition-all duration-300 ease-in-out
          bg-white dark:bg-[#111113]
          border-r border-gray-100/80 dark:border-white/[0.06]
          ${isDesktopCollapsed ? 'w-[68px]' : 'w-[240px]'}
          ${isMobileOpen ? 'max-lg:translate-x-0 max-lg:w-[240px]' : 'max-lg:-translate-x-full'}
          shadow-[2px_0_16px_rgba(0,0,0,0.04)]
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-3 py-3.5 border-b border-gray-100 dark:border-white/[0.06]">
          {!isDesktopCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-xl shrink-0 bg-gradient-to-br ${roleGradients[role]} flex items-center justify-center shadow-sm`}>
                {mounted && user?.company?.logoUrl ? (
                  <img src={user.company.logoUrl} className="w-full h-full object-cover rounded-xl" alt="Logo" />
                ) : (
                  <span className="text-white font-bold text-sm">A</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[#1d1d1f] dark:text-white font-semibold text-[13px] truncate leading-tight">
                  {mounted ? user?.company?.name || 'Atalayas' : ''}
                </p>
                <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 ${roleBadgeColors[role]}`}>
                  {mounted ? roleLabels[role] : ''}
                </span>
              </div>
            </div>
          )}
          {isDesktopCollapsed && (
            <div className={`w-8 h-8 rounded-xl mx-auto bg-gradient-to-br ${roleGradients[role]} flex items-center justify-center shadow-sm`}>
              <span className="text-white font-bold text-sm">A</span>
            </div>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0 max-lg:hidden"
            aria-label={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <i className={`bi ${isDesktopCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} text-xs`} />
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0 lg:hidden"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {/* Search */}
        {!isDesktopCollapsed && (
          <div className="px-3 pt-3 pb-1.5 relative">
            <div className="relative">
              <i className="bi bi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[#86868b] text-[11px]" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar sección..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 150)}
                className="w-full pl-7 pr-3 py-1.5 bg-[#f5f5f7] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] text-[12px] rounded-lg border border-transparent focus:border-[#0071e3]/40 focus:bg-white dark:focus:bg-white/10 outline-none transition-all"
              />
            </div>
            {showSearch && filteredItems.length > 0 && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                {filteredItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f5f5f7] dark:hover:bg-white/5 transition-colors"
                    onClick={() => { setSearch(''); setMobileOpen(false); }}
                  >
                    <div className="w-6 h-6 rounded-md bg-[#0071e3]/10 flex items-center justify-center shrink-0">
                      <i className={`bi ${item.icon} text-[#0071e3] text-[11px]`} />
                    </div>
                    <span className="text-[#1d1d1f] dark:text-white text-[12px] font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-none">
          {groups.map((g, gi) => (
            <div key={g.group} className={gi > 0 ? 'mt-3' : ''}>
              {!isDesktopCollapsed && (
                <p className="text-[9px] uppercase font-bold tracking-[0.12em] text-[#86868b]/70 px-3 mb-1 mt-1">
                  {g.group}
                </p>
              )}
              {isDesktopCollapsed && gi > 0 && (
                <div className="w-5 h-px bg-gray-100 dark:bg-white/[0.06] mx-auto my-2" />
              )}
              <div className="space-y-0.5">
                {g.items.map(item => {
                  const isActive =
                    pathname === item.href ||
                    (item.href.length > 30 && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isDesktopCollapsed ? item.label : undefined}
                      className={`relative flex items-center gap-2.5 rounded-xl transition-all duration-150 text-[13px] font-medium group
                        ${isDesktopCollapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-2'}
                        ${isActive
                          ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3]'
                          : 'text-[#424245] dark:text-[#ebebf5]/80 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-white'
                        }`}
                    >
                      {/* Active indicator */}
                      {isActive && !isDesktopCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#0071e3] rounded-full" />
                      )}

                      <div className={`flex items-center justify-center shrink-0 w-6 h-6 rounded-lg transition-all
                        ${isActive
                          ? 'bg-[#0071e3]/15'
                          : 'group-hover:bg-gray-100 dark:group-hover:bg-white/10'
                        }`}
                      >
                        <i className={`bi ${item.icon} text-[13px] leading-none
                          ${isActive ? 'text-[#0071e3]' : 'text-[#86868b] group-hover:text-[#1d1d1f] dark:group-hover:text-white'}`}
                        />
                      </div>

                      {!isDesktopCollapsed && (
                        <span className="flex-1 truncate leading-none">{item.label}</span>
                      )}

                      {/* Badge */}
                      {!isDesktopCollapsed && item.badge && item.badge > 0 ? (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.1rem] text-center leading-none">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      ) : null}
                      {isDesktopCollapsed && item.badge && item.badge > 0 ? (
                        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#111113]" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-2 border-t border-gray-100 dark:border-white/[0.06] space-y-0.5`}>
          {/* Dark mode toggle */}
          {!isDesktopCollapsed ? (
            <button
              onClick={toggleDark}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[#424245] dark:text-[#ebebf5]/80 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-all"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                <i className={`bi ${dark ? 'bi-sun-fill text-amber-500' : 'bi-moon-fill text-slate-500'} text-[13px]`} />
              </div>
              <span className="text-[12px] flex-1 text-left font-medium">
                {dark ? 'Modo claro' : 'Modo oscuro'}
              </span>
              {/* Toggle pill */}
              <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${dark ? 'bg-[#0071e3]' : 'bg-gray-200 dark:bg-white/20'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${dark ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          ) : (
            <button
              onClick={toggleDark}
              className="w-full flex justify-center px-2 py-2 rounded-xl text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-all"
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              <i className={`bi ${dark ? 'bi-sun-fill text-amber-500' : 'bi-moon-fill'} text-[14px]`} />
            </button>
          )}

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-colors cursor-pointer
              ${isDesktopCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100 dark:ring-white/10">
              {mounted && user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${roleGradients[role]} flex items-center justify-center`}>
                  <span className="text-white text-[11px] font-bold">
                    {mounted && user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            {!isDesktopCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[#1d1d1f] dark:text-white text-[12px] font-semibold truncate leading-tight">
                  {mounted ? user?.name || user?.email?.split('@')[0] : ''}
                </p>
                <p className="text-[#86868b] text-[10px] truncate leading-tight">
                  {mounted ? user?.email : ''}
                </p>
              </div>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[#86868b] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all
              ${isDesktopCollapsed ? 'justify-center' : ''}`}
            title={isDesktopCollapsed ? 'Cerrar sesión' : undefined}
          >
            <i className="bi bi-box-arrow-right text-[13px] shrink-0" />
            {!isDesktopCollapsed && <span className="text-[12px] font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
