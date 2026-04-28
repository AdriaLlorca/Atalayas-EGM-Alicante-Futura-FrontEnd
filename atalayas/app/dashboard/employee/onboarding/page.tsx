'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";
import { motion } from "framer-motion";

export default function EmployeeDashboard() {
  const [onboardingData, setOnboardingData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
      if (storedUser.createdAt) {
        const referenceDate = new Date(storedUser.createdAt);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setCurrentDay(diffDays > 0 ? diffDays : 1);
      }
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [resCourses, resOnboarding] = await Promise.all([
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.ONBOARDING.ME, { headers }),
        ]);

        const dataCourses = await resCourses.json();
        const dataOnboarding = await resOnboarding.json();
        
        setCourses(Array.isArray(dataCourses) ? dataCourses : []);
        setOnboardingData(Array.isArray(dataOnboarding) ? dataOnboarding : []);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const updatedData = onboardingData.map((step) => ({
      ...step,
      onboardingTasks: step.onboardingTasks.map((task: any) =>
        task.id === taskId ? { ...task, userProgress: [{ done: newStatus }] } : task
      ),
    }));
    setOnboardingData(updatedData);

    try {
      const token = localStorage.getItem("token");
      await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskId, done: newStatus }),
      });
    } catch (err) { console.error(err); }
  };

  const firstName = user?.name?.split(' ')[0] || "Usuario";
  const visibleSteps = onboardingData.filter((s) => s.day <= currentDay);
  const allTasks = visibleSteps.flatMap((s) => s.onboardingTasks || []);
  const completedTasks = allTasks.filter((t) => t.userProgress?.[0]?.done).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        
        <PageHeader 
          title={`¡Bienvenido, ${firstName}!`}
          description={`Estás en tu día ${currentDay} de incorporación profesional. Revisa tus objetivos para hoy.`}
          icon={<i className="bi bi-person-badge-fill"></i>}
        />

        <div className="p-6 lg:p-10 flex-1 space-y-10">
          
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* COLUMNA IZQUIERDA: ONBOARDING */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-widest text-[13px]">
                  Ruta de Onboarding
                </h2>
              </div>

              {visibleSteps.map((step) => {
                const isDone = step.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done);
                return (
                  <div key={step.id} className="bg-card border border-border rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isDone ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                        <i className={`bi ${isDone ? 'bi-check-circle-fill' : 'bi-map-fill'}`}></i>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">{step.badge || `Día ${step.day}`}</div>
                        <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{step.description}</p>

                    <div className="grid gap-3">
                      {step.onboardingTasks?.map((task: any) => {
                        const done = task.userProgress?.[0]?.done;
                        return (
                          <div 
                            key={task.id}
                            onClick={() => handleToggleTask(task.id, done)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${done ? 'bg-muted/30 border-transparent opacity-60' : 'bg-background border-border hover:border-secondary shadow-sm'}`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-secondary border-secondary text-black' : 'border-border group-hover:border-secondary'}`}>
                              {done && <i className="bi bi-check-lg text-xs font-bold"></i>}
                            </div>
                            <span className={`text-sm font-bold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {task.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-10">
              
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Progreso Total</h4>
                  <div className="text-xl text-secondary"><i className="bi bi-trophy-fill"></i></div>
                </div>
                <div className="text-5xl font-black text-foreground tracking-tighter mb-4">{progressPercent}%</div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{completedTasks} de {allTasks.length} tareas completadas</p>
              </div>

              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Formación</h2>
                  <Link href="/dashboard/employee/courses" className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline">
                    Ver todos
                  </Link>
                </div>

                <div className="space-y-3">
                  {courses.slice(0, 4).map((course) => (
                    <Link key={course.id} href={`/dashboard/employee/courses/${course.id}`}>
                      <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-2xl hover:border-secondary/50 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 bg-muted border border-border text-muted-foreground rounded-xl flex items-center justify-center group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <i className="bi bi-journal-text text-lg"></i>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-foreground text-sm font-bold truncate">{course.title}</p>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{course.isPublic ? "Campus EGM" : "Empresa"}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 👇 WIDGET DE SOPORTE REACTIVO 👇 */}
              <div className="bg-card dark:bg-[#1E293B] rounded-[2rem] p-8 border border-border dark:border-none shadow-sm transition-all duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/50 mb-2">Soporte</p>
                <h5 className="font-bold text-sm mb-6 leading-snug text-foreground dark:text-white">¿Dudas con tu proceso de entrada?</h5>
                <button className="w-full bg-primary dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/10 dark:shadow-none">
                  Contactar
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}