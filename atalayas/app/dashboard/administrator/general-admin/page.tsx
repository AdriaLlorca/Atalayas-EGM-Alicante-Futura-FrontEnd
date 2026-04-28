'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
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
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ employees: 0, courses: 0, documents: 0, avgProgress: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [usersRes, coursesRes] = await Promise.all([
          fetch(API_ROUTES.USERS.GET_ALL, { headers }),
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
        ]);

        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setStats({
          employees: Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'EMPLOYEE').length : 0,
          courses: Array.isArray(coursesData) ? coursesData.length : 0,
          documents: 0,
          avgProgress: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Empleados', value: stats.employees, icon: 'bi-people' },
    { label: 'Cursos Activos', value: stats.courses, icon: 'bi-journal-code' },
    { label: 'Docs. Firmados', value: stats.documents, icon: 'bi-file-earmark-check' },
    { label: 'Progreso Medio', value: `${stats.avgProgress}%`, icon: 'bi-pie-chart' },
  ];

  const quickActions = [
    { label: 'Alta de empleado', icon: 'bi-person-plus', href: '/dashboard/administrator/employees/new' },
    { label: 'Diseñar curso', icon: 'bi-journal-plus', href: '/dashboard/administrator/general-admin/courses/new' },
    { label: 'Añadir servicio', icon: 'bi-briefcase', href: '/dashboard/administrator/general-admin/services/new' },
    { label: 'Generar informes', icon: 'bi-bar-chart-line', href: '/dashboard/administrator/general-admin/reports' },
  ];

  return (
    // bg-background maneja el fondo general (Gris claro en Light, Azul oscuro en Dark)
    <div className="flex min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Panel de Control"
          description="Resumen operativo y gestión global del ecosistema Atalayas."
          icon={<i className="bi bi-grid"></i>}
        />

        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* ── STATS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat) => (
              <div 
                key={stat.label} 
                className="bg-card rounded-[20px] p-6 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-[140px]"
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-start justify-between w-full">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</h3>
                  <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-all duration-300 shadow-sm">
                    <i className={`bi ${stat.icon} text-sm`}></i>
                  </div>
                </div>
                
                <div>
                  <p className="text-4xl font-extrabold tracking-tighter text-foreground group-hover:text-primary transition-colors">
                    {loading ? <span className="animate-pulse text-muted">—</span> : stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            
            {/* ── CURSOS RECIENTES ── */}
            <div className="bg-card rounded-[20px] border border-border shadow-sm flex flex-col overflow-hidden h-full transition-colors duration-300">
              <div className="px-7 py-5 border-b border-border flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Cursos recientes</h2>
                <Link href="/dashboard/administrator/general-admin/courses" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  Ver todos <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              
              <div className="p-3">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                ) : courses.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground text-xl mb-4 border border-border shadow-inner">
                      <i className="bi bi-journal-x"></i>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No hay cursos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all group cursor-pointer">
                        
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted text-muted-foreground group-hover:bg-background group-hover:text-primary group-hover:shadow-sm border border-transparent group-hover:border-border transition-all">
                          <i className="bi bi-mortarboard-fill"></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{course.title}</p>
                        </div>
                        
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${course.isPublic ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                          {course.isPublic ? 'Global' : 'Privado'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── ACCESOS DIRECTOS ── */}
            <div className="bg-card rounded-[20px] border border-border shadow-sm p-7 h-fit transition-colors duration-300">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground mb-6">Accesos rápidos</h2>
              
              <div className="flex flex-col gap-3">
                {quickActions.map((action) => (
                  <Link 
                    key={action.label} 
                    href={action.href} 
                    className="group relative flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-2xl hover:bg-background hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <i className={`bi ${action.icon} text-lg`}></i>
                    </div>
                    
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </span>

                    <i className="bi bi-chevron-right ml-auto text-muted-foreground/50 group-hover:text-primary transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"></i>
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