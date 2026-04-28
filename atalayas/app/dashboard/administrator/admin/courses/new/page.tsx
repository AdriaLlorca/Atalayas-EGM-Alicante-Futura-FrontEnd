"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(""); // Para avisar al usuario de lo que está pasando

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const [formData, setFormData] = useState({
    title: "",
    isPublic: false,
    category: "BASICO",
    file: null as File | null,
  });

  // NUEVO: Estado para activar/desactivar la IA
  const [useAi, setUseAi] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("El título es obligatorio");
    if (useAi && !formData.file)
      return alert("Para usar la IA necesitas subir un PDF obligatoriamente.");

    setLoading(true);
    setLoadingStep("Creando el curso base...");

    try {
      const token = localStorage.getItem("token");

      // PASO 1: Crear el curso en la base de datos
      const payload = {
        title: formData.title,
        isPublic: formData.isPublic,
        category: formData.category,
        fileUrl: formData.file ? formData.file.name : null,
        companyId: user.companyId || null,
      };

      const resCourse = await fetch(API_ROUTES.COURSES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resCourse.ok) {
        const errorData = await resCourse.json();
        console.error("Error backend curso:", errorData);
        throw new Error("Error al crear el curso base");
      }

      const newCourse = await resCourse.json();

      // PASO 2: Si hay PDF y quiere IA, llamamos a nuestro motor inteligente
      if (useAi && formData.file && newCourse.id) {
        setLoadingStep(
          "🧠 Leyendo PDF y generando voces con IA... (Esto puede tardar unos segundos)",
        );

        const aiFormData = new FormData();
        aiFormData.append("title", `Módulo 1: ${formData.title}`);
        aiFormData.append("order", "1");
        aiFormData.append("file", formData.file);

        // IMPORTANTE: Asegúrate de que esta URL apunta a tu backend correctamente
        const aiRes = await fetch(
          `http://localhost:3000/courses/${newCourse.id}/content/ai`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // ¡No pongas Content-Type! Fetch lo pone solo al usar FormData
            },
            body: aiFormData,
          },
        );

        if (!aiRes.ok) {
          console.error("Error en la IA:", await aiRes.text());
          alert("El curso se creó, pero la IA falló al generar el podcast.");
        }
      }

      // Terminamos y redirigimos
      router.push("/dashboard/administrator/admin/courses");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error en el proceso.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f7]"
      style={{
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <Link
              href="/dashboard/administrator/admin/courses"
              className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
            >
              <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
              <span>Volver a Cursos</span> {/* Opcional: añadir texto mejora el SEO y accesibilidad */}
            </Link>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Nuevo Curso
            </h1>
          </header>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10"
          >
            {/* 1. TÍTULO */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">
                Nombre del Curso
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] outline-none font-bold"
                placeholder="Introduzca nombre del curso"
                disabled={loading}
              />
            </div>

            {/* 2. CATEGORÍA */}
            <div className="space-y-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">
                Tipo de Formación
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: "BASICO" })
                  }
                  disabled={loading}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold ${formData.category === "BASICO" ? "border-[#0071e3] bg-blue-50 text-[#0071e3]" : "border-transparent bg-[#f5f5f7] text-[#86868b]"}`}
                >
                  📖 Onboarding
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: "ESPECIALIZADO" })
                  }
                  disabled={loading}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold ${formData.category === "ESPECIALIZADO" ? "border-[#0071e3] bg-blue-50 text-[#0071e3]" : "border-transparent bg-[#f5f5f7] text-[#86868b]"}`}
                >
                  🎓 Especialización
                </button>
              </div>
            </div>

            {/* 3. MATERIAL PDF */}
            <div className="space-y-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">
                Documento de estudio
              </label>
              <div className="relative h-32 w-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-[#f5f5f7] hover:border-blue-400 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  disabled={loading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <p className="font-bold text-[#1d1d1f]">
                    {formData.file ? formData.file.name : "Seleccionar PDF"}
                  </p>
                  <p className="text-xs text-[#86868b]">
                    {formData.file
                      ? "Archivo listo"
                      : "Formatos aceptados: .pdf"}
                  </p>
                </div>
              </div>
            </div>

            {/* 🚀 NUEVO: BOTÓN MÁGICO DE IA */}
            {formData.file && (
              <div
                onClick={() => !loading && setUseAi(!useAi)}
                className={`p-5 cursor-pointer rounded-2xl border-2 transition-all flex items-center justify-between ${useAi ? "border-purple-500 bg-purple-50" : "border-transparent bg-[#f5f5f7]"}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${useAi ? "bg-purple-200" : "bg-gray-200"}`}
                  >
                    ✨
                  </div>
                  <div>
                    <p
                      className={`font-bold ${useAi ? "text-purple-900" : "text-[#1d1d1f]"}`}
                    >
                      Convertir a Podcast con IA
                    </p>
                    <p
                      className={`text-xs ${useAi ? "text-purple-700" : "text-[#86868b]"}`}
                    >
                      Resume el PDF y genera un audio hiperrealista
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${useAi ? "bg-purple-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${useAi ? "translate-x-6" : "translate-x-0"}`}
                  />
                </div>
              </div>
            )}

            {/* 4. VISIBILIDAD */}
            <div
              onClick={() =>
                !loading &&
                setFormData({ ...formData, isPublic: !formData.isPublic })
              }
              className={`p-6 cursor-pointer rounded-3xl border-2 transition-all flex items-center justify-between ${formData.isPublic ? "border-green-500 bg-green-50" : "bg-[#f5f5f7] border-transparent"}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">
                  {formData.isPublic ? "🌐" : "🔒"}
                </span>
                <div>
                  <p className="font-bold text-[#1d1d1f]">
                    {formData.isPublic ? "Público" : "Privado"}
                  </p>
                  <p className="text-xs text-[#86868b]">
                    Control de acceso global
                  </p>
                </div>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold text-lg hover:bg-[#0077ed] disabled:bg-blue-300 shadow-md transition-all flex flex-col items-center justify-center"
              >
                {loading ? "Procesando..." : "Crear Curso"}
              </button>
              {loadingStep && (
                <p className="text-center text-sm font-medium text-blue-600 mt-4 animate-pulse">
                  {loadingStep}
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
