'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Overview {
  totalCompanies: number;
  totalUsers: number;
  totalEmployees: number;
  totalAdmins: number;
  totalCourses: number;
  publicCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  avgProgress: number;
  totalDocuments: number;
  totalServices: number;
  pendingRequests: number;
}
interface TopCourse { id: string; title: string; _count: { Enrollment: number } }
interface TrendEntry { createdAt: string }
interface StatsData {
  overview: Overview;
  top: { courses: TopCourse[] };
  trends: { usersByMonth: TrendEntry[]; companiesByMonth: TrendEntry[] };
}

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : '';

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function groupByMonth(entries: TrendEntry[]): { label: string; count: number }[] {
  const now = new Date();
  const result: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTHS_ES[d.getMonth()];
    const count = entries.filter((e) => {
      const ed = new Date(e.createdAt);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    }).length;
    result.push({ label, count });
  }
  return result;
}

// ── Gráfico de barras mejorado ─────────────────────────────────────────────
function BarChart({
  data,
  color = '#0071e3',
  height = 110,
}: {
  data: { label: string; count: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barW = 28;
  const gap = 10;
  
  // SOLUCIÓN: Usar Math.max para que el mínimo sea 0
  const totalW = Math.max(0, data.length * (barW + gap) - gap);

  return (
    // Ahora totalW no será negativo, eliminando el error de la consola
    <svg viewBox={`0 0 ${totalW} ${height + 28}`} className="w-full">
      {/* ... resto del código del SVG */}
    </svg>
  );
}

// ── Gráfico de línea mejorado ──────────────────────────────────────────────
function LineChart({
  data,
  color = '#0071e3',
  gradId = 'lg1',
}: {
  data: { label: string; count: number }[];
  color?: string;
  gradId?: string;
}) {
  const W = 300;
  const H = 90;

  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-400 py-4 text-center">Sin datos aún</div>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const pts = data.map((d, i) => ({
    x: data.length === 1 ? W / 2 : (i / (data.length - 1)) * W,
    y: H - (d.count / max) * (H - 8),
    ...d,
  }));

  // Smooth curve using bezier
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = pts.length > 0
    ? pathD + ` L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i}
          x1={0} y1={H * (1 - f)} x2={W} y2={H * (1 - f)}
          stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 4"
          className="dark:stroke-white/10"
        />
      ))}
      {areaD && <path d={areaD} fill={`url(#${gradId})`} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} className="dark:fill-[#1c1c1e]" />
          <text x={p.x} y={H + 15} textAnchor="middle" fontSize={8.5} fill="#86868b" fontWeight={500}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Gráfico de dona mejorado ───────────────────────────────────────────────
function DonutChart({
  segments,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel?: string;
}) {
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  const R = 42;
  const cx = 56;
  const cy = 56;
  const innerR = 26;

  let cumAngle = -Math.PI / 2;
  const paths = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;

    // Inner arc
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;

    return {
      d,
      color: seg.color,
      label: seg.label,
      value: seg.value,
      pct: Math.round((seg.value / total) * 100),
    };
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 112 112" className="w-24 h-24 shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1d1d1f" className="dark:fill-white">
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize={7.5} fill="#86868b">
          {centerLabel || 'total'}
        </text>
      </svg>
      <div className="space-y-2 flex-1 min-w-0">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-[12px] text-[#424245] dark:text-[#ebebf5] truncate flex-1">{p.label}</span>
            <span className="text-[12px] font-semibold text-[#1d1d1f] dark:text-white tabular-nums">{p.value}</span>
            <span className="text-[10px] text-[#86868b] w-7 text-right tabular-nums">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon, color, bg, trend,
}: {
  label: string; value: string | number; icon: string;
  color: string; bg: string; trend?: { value: number; up: boolean };
}) {
  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} transition-transform group-hover:scale-110 duration-200`}>
          <i className={`bi ${icon} text-sm ${color}`} />
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5
            ${trend.up ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
            <i className={`bi ${trend.up ? 'bi-arrow-up' : 'bi-arrow-down'} text-[9px]`} />
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1d1d1f] dark:text-white tracking-tight tabular-nums">{value}</p>
      <p className="text-[11px] text-[#86868b] mt-0.5">{label}</p>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-white/[0.06] rounded-xl ${className}`} />;
}

// ── Progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ value, color = '#0071e3' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setCurrentUser(JSON.parse(saved));

    fetchWithApiFallback(API_ROUTES.STATS.GET, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const usersByMonth = useMemo(
    () => (stats ? groupByMonth(stats.trends.usersByMonth) : []),
    [stats],
  );
  const companiesByMonth = useMemo(
    () => (stats ? groupByMonth(stats.trends.companiesByMonth) : []),
    [stats],
  );

  const ov = stats?.overview;

  const roleSegments = ov
    ? [
        { label: 'Empleados', value: ov.totalEmployees, color: '#10b981' },
        { label: 'Admins', value: ov.totalAdmins, color: '#0071e3' },
        {
          label: 'Otros',
          value: Math.max(0, ov.totalUsers - ov.totalEmployees - ov.totalAdmins),
          color: '#a855f7',
        },
      ].filter((s) => s.value > 0)
    : [];

  const enrollSegments = ov
    ? [
        { label: 'Completadas', value: ov.completedEnrollments, color: '#10b981' },
        {
          label: 'En progreso',
          value: Math.max(0, ov.totalEnrollments - ov.completedEnrollments),
          color: '#0071e3',
        },
      ].filter((s) => s.value > 0)
    : [];

  const role = currentUser?.role ?? 'GENERAL_ADMIN';
  const basePath = role === 'GENERAL_ADMIN' ? '/dashboard/administrator/general-admin' : '/dashboard/administrator/admin';

  const kpiList = ov ? [
    { label: 'Empresas', value: ov.totalCompanies, icon: 'bi-buildings-fill', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Usuarios totales', value: ov.totalUsers, icon: 'bi-people-fill', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Empleados', value: ov.totalEmployees, icon: 'bi-person-badge-fill', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Cursos', value: ov.totalCourses, icon: 'bi-mortarboard-fill', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Matrículas', value: ov.totalEnrollments, icon: 'bi-journal-check', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { label: 'Completadas', value: ov.completedEnrollments, icon: 'bi-patch-check-fill', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Documentos', value: ov.totalDocuments, icon: 'bi-file-earmark-fill', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    {
      label: 'Solicitudes',
      value: ov.pendingRequests,
      icon: 'bi-envelope-exclamation-fill',
      color: ov.pendingRequests > 0 ? 'text-red-600' : 'text-gray-500',
      bg: ov.pendingRequests > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-white/5',
    },
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f]">
      <Sidebar role={role} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f5f5f7]/80 dark:bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[0.06] px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1.5 text-[11px] text-[#86868b] mb-1">
                <Link href={basePath} className="hover:text-[#0071e3] transition-colors">Panel</Link>
                <i className="bi bi-chevron-right text-[9px]" />
                <span className="text-[#1d1d1f] dark:text-white font-medium">Estadísticas</span>
              </nav>
              <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                Estadísticas de la plataforma
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#86868b] bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                <i className="bi bi-calendar3 mr-1.5" />
                Últimos 6 meses
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3">
              <i className="bi bi-exclamation-triangle-fill text-red-500 text-lg shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Error al cargar estadísticas</p>
                <p className="text-xs text-red-600/70 dark:text-red-500/70 mt-0.5">Comprueba que el servidor está activo e inténtalo de nuevo.</p>
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[100px]" />)
              : kpiList.map((kpi) => (
                  <KpiCard key={kpi.label} {...kpi} />
                ))}
          </div>

          {/* Fila 2: Tendencias con tabs */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div>
                <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Tendencia de crecimiento</h2>
                <p className="text-[11px] text-[#86868b] mt-0.5">Nuevos registros por mes</p>
              </div>
              <div className="flex bg-[#f5f5f7] dark:bg-white/[0.06] rounded-xl p-0.5">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${activeTab === 'users' ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}
                >
                  Usuarios
                </button>
                <button
                  onClick={() => setActiveTab('companies')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${activeTab === 'companies' ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}
                >
                  Empresas
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-[#1d1d1f] dark:text-white tabular-nums">
                  {loading ? '—' : activeTab === 'users'
                    ? usersByMonth.reduce((s, d) => s + d.count, 0)
                    : companiesByMonth.reduce((s, d) => s + d.count, 0)}
                </span>
                <span className="text-[12px] text-[#86868b]">
                  {activeTab === 'users' ? 'nuevos usuarios' : 'nuevas empresas'} en los últimos 6 meses
                </span>
              </div>
              {loading ? (
                <Skeleton className="h-32" />
              ) : (
                <LineChart
                  data={activeTab === 'users' ? usersByMonth : companiesByMonth}
                  color={activeTab === 'users' ? '#0071e3' : '#7c3aed'}
                  gradId={activeTab}
                />
              )}
            </div>
          </div>

          {/* Fila 3: Barras lado a lado */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Nuevos usuarios</h2>
                  <p className="text-[11px] text-[#86868b] mt-0.5">Mensual · últimos 6 meses</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <i className="bi bi-people-fill text-blue-600 text-sm" />
                </div>
              </div>
              {loading ? <Skeleton className="h-32" /> : <BarChart data={usersByMonth} color="#0071e3" />}
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Nuevas empresas</h2>
                  <p className="text-[11px] text-[#86868b] mt-0.5">Mensual · últimos 6 meses</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <i className="bi bi-buildings-fill text-violet-600 text-sm" />
                </div>
              </div>
              {loading ? <Skeleton className="h-32" /> : <BarChart data={companiesByMonth} color="#7c3aed" />}
            </div>
          </div>

          {/* Fila 4: Donuts + top cursos */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">Usuarios por rol</h2>
              <p className="text-[11px] text-[#86868b] mb-4">Distribución actual</p>
              {loading ? <Skeleton className="h-24" /> : roleSegments.length === 0 ? (
                <p className="text-sm text-[#86868b] text-center py-6">Sin datos</p>
              ) : (
                <DonutChart segments={roleSegments} centerLabel="usuarios" />
              )}
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">Estado de matrículas</h2>
              <p className="text-[11px] text-[#86868b] mb-4">Progreso y completitud</p>
              {loading ? <Skeleton className="h-24" /> : enrollSegments.length === 0 ? (
                <p className="text-sm text-[#86868b] text-center py-6">Sin matrículas</p>
              ) : (
                <DonutChart segments={enrollSegments} centerLabel="matrículas" />
              )}
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">Cursos más populares</h2>
              <p className="text-[11px] text-[#86868b] mb-4">Por número de matrículas</p>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : !stats?.top.courses.length ? (
                <p className="text-sm text-[#86868b] text-center py-6">Sin datos</p>
              ) : (
                <div className="space-y-3">
                  {stats.top.courses.map((c, i) => {
                    const maxEnroll = stats.top.courses[0]._count.Enrollment || 1;
                    const pct = Math.round((c._count.Enrollment / maxEnroll) * 100);
                    const colors = ['#0071e3', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
                    return (
                      <div key={c.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] text-[#1d1d1f] dark:text-white font-medium truncate max-w-[140px]">
                            <span className="text-[#86868b] mr-1">{i + 1}.</span>{c.title}
                          </span>
                          <span className="text-[11px] text-[#86868b] ml-1 shrink-0 tabular-nums">
                            {c._count.Enrollment}
                          </span>
                        </div>
                        <ProgressBar value={pct} color={colors[i % colors.length]} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Fila 5: Métricas de rendimiento + resumen */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">Métricas de formación</h2>
              <p className="text-[11px] text-[#86868b] mb-5">Rendimiento y completitud de cursos</p>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    {
                      label: 'Tasa de completado',
                      value: ov?.completionRate ?? 0,
                      color: (ov?.completionRate ?? 0) >= 50 ? '#10b981' : '#f59e0b',
                      icon: 'bi-patch-check-fill',
                    },
                    {
                      label: 'Progreso medio',
                      value: ov?.avgProgress ?? 0,
                      color: (ov?.avgProgress ?? 0) >= 50 ? '#0071e3' : '#f59e0b',
                      icon: 'bi-graph-up-arrow',
                    },
                    {
                      label: 'Cursos públicos',
                      value: ov ? Math.round((ov.publicCourses / Math.max(ov.totalCourses, 1)) * 100) : 0,
                      color: '#7c3aed',
                      icon: 'bi-globe2',
                      custom: `${ov?.publicCourses ?? 0} / ${ov?.totalCourses ?? 0}`,
                    },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <i className={`bi ${m.icon} text-[13px]`} style={{ color: m.color }} />
                          <span className="text-[12px] text-[#424245] dark:text-[#ebebf5]">{m.label}</span>
                        </div>
                        <span className="text-[13px] font-bold text-[#1d1d1f] dark:text-white tabular-nums">
                          {m.custom || `${m.value}%`}
                        </span>
                      </div>
                      <ProgressBar value={m.value} color={m.color} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06]">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">Resumen del sistema</h2>
              <p className="text-[11px] text-[#86868b] mb-5">Estado general de la plataforma</p>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: 'Tasa de completado', value: `${ov?.completionRate ?? 0}%`, ok: (ov?.completionRate ?? 0) >= 50, icon: 'bi-check-circle-fill' },
                    { label: 'Progreso medio usuarios', value: `${ov?.avgProgress ?? 0}%`, ok: (ov?.avgProgress ?? 0) >= 50, icon: 'bi-speedometer2' },
                    { label: 'Cursos públicos', value: `${ov?.publicCourses ?? 0} de ${ov?.totalCourses ?? 0}`, ok: true, icon: 'bi-globe2' },
                    { label: 'Solicitudes pendientes', value: String(ov?.pendingRequests ?? 0), ok: (ov?.pendingRequests ?? 0) === 0, icon: 'bi-envelope-fill' },
                    { label: 'Servicios activos', value: String(ov?.totalServices ?? 0), ok: true, icon: 'bi-suitcase-lg-fill' },
                    { label: 'Documentos subidos', value: String(ov?.totalDocuments ?? 0), ok: true, icon: 'bi-file-earmark-text-fill' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-white/[0.04] transition-colors">
                      <i className={`bi ${row.icon} text-[12px] ${row.ok ? 'text-[#86868b]' : 'text-red-400'}`} />
                      <span className="text-[12px] text-[#424245] dark:text-[#ebebf5] flex-1">{row.label}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg tabular-nums
                        ${row.ok
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href={basePath}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] text-[12px] font-medium transition-all"
              >
                <i className="bi bi-house-fill text-[11px]" />
                Ver panel principal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
