"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";

export default function NewAIContentPage() {
  const { id } = useParams(); // ID del curso
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sourceType, setSourceType] = useState<"file" | "link">("file");

  // Opciones de Generación IA (Estado funcional y visual)
  const [options, setOptions] = useState({
    generateSummary: true,
    generateQuiz: false,
    generatePodcast: false,
  });

  // Datos del formulario (nullable/opcionales excepto título)
  const [formData, setFormData] = useState({
    title: "",
    url: "", // Link si sourceType es link
    file: null as File | null, // Archivo PDF nullable
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación visual premium
    if (!formData.title.trim())
      return alert("⚠️ El título de la lección es obligatorio");

    setLoading(true);

    if (!id) {
      console.error("No se encontró el ID del curso");
      setLoading(false);
      return;
    }

    // 1. Siempre usamos FormData para envíos que INCLUYEN archivos binarios
    const data = new FormData();
    data.append("title", formData.title);

    // Enviamos las opciones de IA como un string JSON que el backend parseará
    data.append("options", JSON.stringify(options));

    // 2. Lógica Nullable: Solo añadimos el archivo o la URL si existen
    if (sourceType === "file" && formData.file) {
      data.append("file", formData.file);
    } else if (sourceType === "link" && formData.url) {
      data.append("externalUrl", formData.url);
    }

    try {
      const token = localStorage.getItem("token");

      // Llamada al fetch (Sin Content-Type manual)
      const res = await fetch(API_ROUTES.CONTENT.CREATE(id as string), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data, // Enviamos FormData directamente
      });

      if (res.ok) {
        // Volvemos a la moderación del curso
        router.push(`/dashboard/administrator/admin/courses/${id}`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(
          `Error del servidor: ${errorData.message || "No se pudo generar el contenido"}`,
        );
      }
    } catch (error) {
      console.error("Error crítico:", error);
      alert("Fallo de conexión con el servidor.");
    } finally {
      setLoading(false);
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
      {" "}
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* NAVEGACIÓN Y TÍTULO (ESTILO PREVIO) */}
          <header className="mb-12">
            <Link
              href={`/dashboard/administrator/admin/courses/${id}`}
              className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
            >
              <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
              <span>Volver al curso</span> {/* Opcional: añadir texto mejora el SEO y accesibilidad */}
            </Link>
            <div className="flex items-center gap-4 mt-4">
              <div className="inline-block p-4 bg-[#d9ff00] rounded-3xl shadow-lg shadow-lime-900/10">
                <i className="bi bi-robot text-[#005596] text-3xl"></i>
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight">
                  Generador de Contenido IA
                </h1>
                <p className="text-[#86868b] text-lg">
                  Sube un documento o enlace y deja que la IA cree la lección.
                </p>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. DATOS BÁSICOS (TÍTULO) */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">
                Nombre de la Unidad / Lección
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  console.log("Escribiendo:", e.target.value); // Añade este log para ver si detecta el cambio
                  setFormData({ ...formData, title: e.target.value });
                }}
                className="w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 border-transparent focus:border-blue-300 outline-none font-bold text-black"
                placeholder="Ej: Manual de Bienvenida v2"
              />
            </div>

            {/* 2. FUENTE DEL CONTENIDO (SELECTOR Y INPUTS) */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setSourceType("file")}
                  className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-3 cursor-pointer ${sourceType === "file" ? "border-[#005596] bg-blue-50 text-[#005596]" : "border-gray-100 bg-white text-gray-400"}`}
                >
                  <i className="bi bi-file-earmark-pdf text-xl"></i> Subir PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("link")}
                  className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-3 cursor-pointer ${sourceType === "link" ? "border-[#005596] bg-blue-50 text-[#005596]" : "border-gray-100 bg-white text-gray-400"}`}
                >
                  <i className="bi bi-link-45deg text-xl"></i> Enlace Web
                </button>
              </div>

              {sourceType === "file" ? (
                <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center hover:border-blue-400 transition-colors cursor-pointer relative bg-gray-50/50">
                  <input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <i className="bi bi-cloud-arrow-up text-5xl text-gray-300 mb-4 block"></i>
                  <p className="text-base font-bold text-black">
                    {formData.file
                      ? formData.file.name
                      : "Arrastra tu PDF aquí o haz click"}
                  </p>
                  <p className="text-xs text-[#86868b] mt-1">
                    {formData.file
                      ? "Archivo listo para procesar"
                      : "Máx: 10MB (Formatos: .pdf)"}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <i className="bi bi-link-45deg absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                  <input
                    type="url"
                    value={formData.url}
                    placeholder="https://ejemplo.com/articulo-interesante"
                    className="w-full px-14 py-5 bg-[#f5f5f7] rounded-2xl border-2 border-transparent focus:border-blue-300 outline-none font-bold text-black"
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            {/* 3. OPCIONES DE IA (MODERNAS, CON CURSOR POINTER) */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-[#1d1d1f] mb-6">
                ¿Qué quieres que genere la IA?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Checkbox Card: Resumen */}
                <button
                  type="button"
                  onClick={() =>
                    setOptions({
                      ...options,
                      generateSummary: !options.generateSummary,
                    })
                  }
                  className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer group active:scale-[0.98] ${
                    options.generateSummary
                      ? "border-[#d9ff00] bg-white shadow-lg shadow-lime-900/10"
                      : "border-gray-100 opacity-60 grayscale hover:opacity-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${options.generateSummary ? "bg-blue-100" : "bg-gray-100"}`}
                  >
                    <i
                      className={`bi bi-text-paragraph text-2xl ${options.generateSummary ? "text-[#005596]" : "text-gray-400"}`}
                    ></i>
                  </div>
                  <p className="font-black text-base text-[#1d1d1f]">
                    Resumen IA
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">
                    Extrae los puntos clave y crea el resumen de la lección.
                  </p>
                </button>

                {/* Checkbox Card: Quiz */}
                <button
                  type="button"
                  onClick={() =>
                    setOptions({
                      ...options,
                      generateQuiz: !options.generateQuiz,
                    })
                  }
                  className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer group active:scale-[0.98] ${
                    options.generateQuiz
                      ? "border-[#d9ff00] bg-white shadow-lg shadow-lime-900/10"
                      : "border-gray-100 opacity-60 grayscale hover:opacity-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${options.generateQuiz ? "bg-orange-100" : "bg-gray-100"}`}
                  >
                    <i
                      className={`bi bi-patch-question text-2xl ${options.generateQuiz ? "text-orange-600" : "text-gray-400"}`}
                    ></i>
                  </div>
                  <p className="font-black text-base text-[#1d1d1f]">Test IA</p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">
                    Crea 5 preguntas interactivas automáticas.
                  </p>
                </button>

                {/* Checkbox Card: Podcast */}
                <button
                  type="button"
                  onClick={() =>
                    setOptions({
                      ...options,
                      generatePodcast: !options.generatePodcast,
                    })
                  }
                  className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer group active:scale-[0.98] ${
                    options.generatePodcast
                      ? "border-[#d9ff00] bg-white shadow-lg shadow-lime-900/10"
                      : "border-gray-100 opacity-60 grayscale hover:opacity-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${options.generatePodcast ? "bg-purple-100" : "bg-gray-100"}`}
                  >
                    <i
                      className={`bi bi-mic text-2xl ${options.generatePodcast ? "text-purple-600" : "text-gray-400"}`}
                    ></i>
                  </div>
                  <p className="font-black text-base text-[#1d1d1f]">
                    Podcast IA
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">
                    Genera un audio con voz sintetizada realista.
                  </p>
                </button>
              </div>
            </div>

            {/* BOTÓN SUBMIT (FUNCIONAL Y VISUAL PREMIUM) */}
            <button
              type="submit"
              // Solo deshabilitamos mientras carga (permitimos nullable)
              disabled={loading}
              className="w-full py-6 bg-[#005596] text-white rounded-[2rem] font-black uppercase tracking-widest text-lg hover:bg-[#d9ff00] hover:text-[#005596] transition-all shadow-xl shadow-blue-900/20 disabled:bg-gray-400 disabled:opacity-50 disabled:shadow-none cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>{" "}
                  Procesando con IA de Atalayas...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <i className="bi bi-magic text-xl"></i> Generar Lección
                </span>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
