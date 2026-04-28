"use client";

import Sidebar from "@/components/ui/Sidebar";
import OnboardingPreview from "@/components/views/OnboardingPreview";
import { API_ROUTES } from "@/lib/utils";
import { useState, useEffect } from "react";

// Definimos los destinos posibles para el auto-completado
const ROUTE_OPTIONS = [
  { label: "Manual (Sin acción)", value: "" },
  { label: "Subir Documentos", value: "/dashboard/documents" },
  { label: "Mis Cursos", value: "/dashboard/employee/courses" },
  { label: "Mi Perfil / Datos", value: "/dashboard/profile" },
  { label: "Servicios", value: "/dashboard/employee/services" },
];

interface CourseContent {
  id: string;
  title: string;
}

interface Course {
  id: string;
  title: string;
  Content?: CourseContent[];
  content?: CourseContent[];
}

export default function OnboardingConfig() {
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([
    { day: 1, title: "", description: "", tasks: [{ label: "", linkAction: "" }] },
  ]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

// Cargamos los cursos al iniciar
useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await fetch(API_ROUTES.COURSES.GET_ALL , { // Ajusta tu ruta de cursos
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data);
      }
    } catch (e) { console.error("Error cargando cursos", e); }
  };
  fetchCourses();
}, []);

  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const response = await fetch(API_ROUTES.ONBOARDING.ME, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const formattedSteps = data.map((s: any) => ({
              day: s.day,
              title: s.title,
              description: s.description || "",
              // Adaptamos la carga del backend
              tasks: s.onboardingTasks?.map((t: any) => ({
                label: t.label,
                linkAction: t.linkAction || ""
              })) || [{ label: "", linkAction: "" }],
            }));
            setSteps(formattedSteps);
          }
        }
      } catch (error) {
        console.error("Error cargando onboarding:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOnboarding();
  }, []);

  const addStep = () => {
    setSteps([
      ...steps,
      { day: steps.length + 1, title: "", description: "", tasks: [{ label: "", linkAction: "" }] },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return; // No permitir borrar el último paso
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, day: i + 1 })); // Recalcular los días para que sean correlativos
    setSteps(newSteps);
  };

  const addTask = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks.push({ label: "", linkAction: "" });
    setSteps(newSteps);
  };

  const updateTask = (stepIndex: number, taskIndex: number, field: "label" | "linkAction", value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks[taskIndex][field] = value;
    setSteps(newSteps);
  };

  const removeTask = (stepIndex: number, taskIndex: number) => {
    const newSteps = [...steps];
    if (newSteps[stepIndex].tasks.length > 1) {
      newSteps[stepIndex].tasks = newSteps[stepIndex].tasks.filter((_, i) => i !== taskIndex);
      setSteps(newSteps);
    }
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(API_ROUTES.ONBOARDING.SETUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ steps }), // Enviamos el objeto completo con linkAction
      });
      if (response.ok) alert("¡Plan guardado con éxito!");
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  const stepsForPreview = steps.map((s) => ({
    ...s,
    onboardingTasks: s.tasks.map((t, idx) => ({ id: idx.toString(), label: t.label })),
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f5f7] items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#005596]/10 border-t-[#005596] rounded-full animate-spin"></div>
      </div>
    );
  }

 return (
  <div
    className="flex min-h-screen bg-[#f5f5f7]"
    style={{
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    }}
  >
    <Sidebar role="ADMIN" />

    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Configuración de Onboarding
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              Gestiona el plan de bienvenida y automatiza tareas mediante enlaces inteligentes.
            </p>

            <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit">
              <button
                onClick={() => setView("edit")}
                className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  view === "edit" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setView("preview")}
                className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  view === "preview" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Vista Previa
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <i className="bi bi-cloud-arrow-up-fill"></i> Guardar Plan
          </button>
        </header>

        {view === "edit" ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {steps.map((step, sIdx) => (
              <div
                key={sIdx}
                className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                {/* Botón borrar día */}
                <button
                  onClick={() => removeStep(sIdx)}
                  className="absolute top-6 right-6 text-gray-300 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <i className="bi bi-trash3-fill text-xl"></i>
                </button>

                {/* Cabecera: Día y Título */}
                <div className="flex gap-6 mb-8 pr-10">
                  <div className="text-center">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-tighter">
                      Día
                    </label>
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-xl font-black border border-blue-100 shadow-inner">
                      {step.day}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-tighter">
                      Título del bloque de bienvenida
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      className="w-full text-xl font-bold border-b-2 border-gray-50 py-1 outline-none focus:border-blue-500 transition-all bg-transparent"
                      onChange={(e) => updateStep(sIdx, "title", e.target.value)}
                      placeholder="Ej: Integración Cultural"
                    />
                  </div>
                </div>

                {/* Listado de tareas */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                    Acciones requeridas para el empleado
                  </label>

                  {step.tasks.map((task, tIdx) => (
                    <div 
                      key={tIdx} 
                      className="p-4 bg-[#f9fafb] rounded-xl border border-gray-100 space-y-3 transition-shadow hover:shadow-md hover:bg-white group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            value={task.label}
                            placeholder="Nombre de la tarea..."
                            className="w-full bg-white px-4 py-2 rounded-lg text-sm border border-gray-200 focus:border-blue-300 outline-none transition"
                            onChange={(e) => updateTask(sIdx, tIdx, "label", e.target.value)}
                          />
                        </div>

                        <div className="w-52">
                          <select
                            value={task.linkAction?.split('?')[0] || ""}
                            className="w-full bg-white px-3 py-2 rounded-lg text-[11px] font-black text-blue-700 border border-gray-200 outline-none cursor-pointer uppercase tracking-tighter"
                            onChange={(e) => updateTask(sIdx, tIdx, "linkAction", e.target.value)}
                          >
                            {ROUTE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {step.tasks.length > 1 && (
                          <button
                            onClick={() => removeTask(sIdx, tIdx)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          >
                            <i className="bi bi-x-circle-fill text-lg"></i>
                          </button>
                        )}
                      </div>

                      {/* LÓGICA DE SELECTORES ANIDADOS */}
                      {task.linkAction?.includes('/dashboard/employee/courses') && (
                        <div className="flex flex-col gap-2 pl-6 border-l-2 border-blue-200 ml-2 animate-in slide-in-from-left-2">
                          
                          {/* NIVEL 2: CURSO */}
                          <div className="flex items-center gap-2">
                            <i className="bi bi-arrow-return-right text-blue-400"></i>
                            <select
                              className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-semibold text-blue-800 border border-blue-100 outline-none cursor-pointer"
                              value={task.linkAction.split('courseId=')[1]?.split('&')[0] || ""}
                              onChange={(e) => {
                                const cId = e.target.value;
                                updateTask(sIdx, tIdx, "linkAction", `/dashboard/employee/courses?courseId=${cId}`);
                              }}
                            >
                              <option value="">-- Seleccionar curso (Opcional) --</option>
                              {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                          </div>

                          {/* NIVEL 3: CONTENIDO (Usando tu lógica de filtrado en memoria) */}
                          {(() => {
                            const currentCourseId = task.linkAction.split('courseId=')[1]?.split('&')[0];
                            const selectedCourse = availableCourses.find(c => c.id === currentCourseId);
                            const contentList = selectedCourse?.Content || selectedCourse?.content || [];

                            if (contentList.length > 0) {
                              return (
                                <div className="flex items-center gap-2 pl-6 animate-in slide-in-from-left-3">
                                  <i className="bi bi-arrow-return-right text-green-500"></i>
                                  <select
                                    className="flex-1 bg-green-50/50 px-3 py-2 rounded-lg text-[11px] font-bold text-green-800 border border-green-100 outline-none cursor-pointer"
                                    value={task.linkAction.split('contentId=')[1] || ""}
                                    onChange={(e) => {
                                      const contId = e.target.value;
                                      const content = contentList.find((c: any) => c.id === contId);
                                      updateTask(sIdx, tIdx, "linkAction", `/dashboard/employee/courses?courseId=${currentCourseId}&contentId=${contId}`);
                                      if (!task.label && content) {
                                        updateTask(sIdx, tIdx, "label", `Ver: ${content.title}`);
                                      }
                                    }}
                                  >
                                    <option value="">-- Ir a una lección específica --</option>
                                    {contentList.map((c: any) => (
                                      <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addTask(sIdx)}
                    className="text-xs text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 mt-4 hover:bg-blue-50 w-fit px-4 py-2 rounded-lg transition-all"
                  >
                    <i className="bi bi-plus-circle-fill"></i> Añadir Tarea
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addStep}
              className="w-full py-10 border-2 border-dashed border-gray-300 rounded-3xl text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-white transition-all font-bold flex flex-col items-center justify-center gap-3 group"
            >
              <i className="bi bi-plus-square-dotted text-4xl group-hover:scale-110 transition-transform"></i>
              <span className="text-sm uppercase tracking-[0.2em]">Nuevo día de Onboarding</span>
            </button>
          </div>
        ) : (
          <OnboardingPreview steps={stepsForPreview} />
        )}
      </div>
    </main>
  </div>
);
}