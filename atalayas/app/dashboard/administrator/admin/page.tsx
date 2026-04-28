'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader'; // Banner unificado
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Stats {
  employees: number;
  courses: number;
  documents: number;
  avgProgress: number;
}

interface Course {
  id: string;
  title: string;
  isPublic: boolean;
  _count?: { Enrollment: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ employees: 0, courses: 0, documents: 0, avgProgress: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [usersRes, coursesRes] = await Promise.all([
          fetch(API_ROUTES.USERS.GET_ALL, { headers }),
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
        ]);

        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setStats({
          employees: Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'EMPLOYEE').length : 0,
          courses: Array.isArray(coursesData) ? coursesData.filter((c: any) => !c.isPublic).length : 0,
          documents: 0,
          avgProgress: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Empleados', value: stats.employees, icon: <i className="bi bi-people text-secondary"></i> },
    { label: 'Cursos activos', value: stats.courses, icon: <i className="bi bi-journal-bookmark text-primary"></i> },
    { label: 'Documentos', value: stats.documents, icon:  <i className="bi bi-folder2-open text-primary"></i> },
    { label: 'Progreso medio', value: `${stats.avgProgress}%`, icon: <i className="bi bi-graph-up-arrow text-secondary"></i> },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        
        {/* BANNER SUPERIOR UNIFICADO (Full-bleed) */}
        <PageHeader 
          title="Atalayas Hub"
          description="Bienvenido al panel de gestión de Atalayas Ciudad Empresarial. Coordina formación y administra recursos."
          icon={<i className="bi bi-buildings-fill"></i>}
        />

        {/* CONTENIDO CON PADDING */}
        <div className="p-6 lg:p-10 flex-1 space-y-8">
          
          {/* TARJETAS DE ESTADÍSTICAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-card rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                  <div className="text-xl bg-muted/50 border border-border w-10 h-10 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight">
                  {loading ? <div className="h-8 w-12 bg-muted animate-pulse rounded-md" /> : stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* LISTADO DE CURSOS */}
            <div className="lg:col-span-2 bg-card border border-border rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Cursos de la empresa</h2>
                <Link href="/dashboard/administrator/admin/courses" className="text-secondary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                  Ver todos <i className="bi bi-arrow-right-short text-lg"></i>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl bg-muted/20">
                  <div className="text-4xl text-muted-foreground/30 mb-4"><i className="bi bi-journal-x"></i></div>
                  <p className="text-muted-foreground text-sm font-bold mb-6">No hay cursos disponibles actualmente</p>
                  <Link href="/dashboard/administrator/admin/courses/manage/new" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                    Crear primer curso
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-secondary/50 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted border border-border text-muted-foreground rounded-xl flex items-center justify-center group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
                          <i className="bi bi-journal-bookmark text-xl"></i>
                        </div>
                        <span className="text-foreground text-sm font-bold">{course.title}</span>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${course.isPublic ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {course.isPublic ? 'EGM' : 'Privado'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCIONES RÁPIDAS */}
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground tracking-tight mb-8">Acciones rápidas</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Nuevo empleado', icon: <i className="bi bi-person-add"></i>, href: '/dashboard/administrator/employees/new' },
                  { label: 'Nuevo curso', icon: <i className="bi bi-journal-plus"></i>, href: '/dashboard/administrator/admin/courses/manage/new' },
                  { label: 'Nuevo servicio', icon: <i className="bi bi-briefcase"></i>, href: '/dashboard/administrator/admin/services/new' },
                  { label: 'Documentos', icon: <i className="bi bi-folder2-open"></i> , href: '/dashboard/documents' },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-2xl hover:bg-background hover:border-secondary hover:shadow-md transition-all group"
                  >
                    <div className="text-xl text-primary group-hover:text-secondary group-hover:scale-110 transition-all">
                      {action.icon}
                    </div>
                    <span className="text-foreground text-sm font-bold transition-colors">{action.label}</span>
                    <i className="bi bi-chevron-right ml-auto text-xs text-muted-foreground group-hover:text-secondary transition-colors"></i>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}