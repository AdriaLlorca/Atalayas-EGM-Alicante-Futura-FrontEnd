"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import Link from "next/link";

const inputClass =
  "w-full px-6 py-4 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] placeholder:text-[#c7c7cc]";

export default function NewCompanyService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    isPublic: false, // Siempre privado — solo para su empresa
    providerName: "",
    phone: "",
    email: "",
    address: "",
    schedule: "",
    externalUrl: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: "El título es necesario para crear el servicio" });
      return;
    }

    setLoading(true);
    const clean = (v: string) => v.trim() || null;

    try {
      const res = await fetch(API_ROUTES.SERVICES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: clean(formData.description),
          mediaUrl: clean(formData.mediaUrl),
          isPublic: false,
          providerName: clean(formData.providerName),
          phone: clean(formData.phone),
          email: clean(formData.email),
          address: clean(formData.address),
          schedule: clean(formData.schedule),
          externalUrl: clean(formData.externalUrl),
          price: clean(formData.price),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/administrator/admin/services");
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || "No se pudo crear el servicio"}`);
      }
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

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
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <Link
              href="/dashboard/administrator/admin/services"
              className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
            >
              <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
              <span>Volver a Servicios</span> {/* Opcional: añadir texto mejora el SEO y accesibilidad */}
            </Link>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Crear nuevo servicio
            </h1>
            <p className="text-[#86868b] mt-2 text-lg">
              Este servicio será visible solo para los empleados de tu empresa.
            </p>
          </header>


          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* ── SECCIÓN 1: INFO PRINCIPAL ──────────────────────────── */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">
                Información Principal
              </label>

              {/* Título */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Título del servicio..."
                  value={formData.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (errors.title) setErrors({});
                  }}
                  className={`w-full px-6 py-5 rounded-2xl outline-none transition-all text-xl font-bold ${
                    errors.title
                      ? "border-2 border-red-400 bg-red-50/30 text-red-900"
                      : "border-2 border-transparent bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white text-[#1d1d1f]"
                  }`}
                />
                <div className="h-5 mt-1 ml-1">
                  {errors.title && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <span>⚠️</span> {errors.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <textarea
                placeholder="Descripción detallada del servicio..."
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                className="w-full px-6 py-5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all resize-none text-[#424245] leading-relaxed placeholder:text-[#c7c7cc]"
              />

              {/* Imagen */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#86868b] ml-1">
                  Imagen de portada (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://tusitio.com/imagen.jpg"
                  value={formData.mediaUrl}
                  onChange={(e) => set("mediaUrl", e.target.value)}
                  className={inputClass}
                />
                {formData.mediaUrl && (
                  <div className="mt-3 rounded-2xl overflow-hidden h-36 w-full border border-gray-100">
                    <img
                      src={formData.mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── SECCIÓN 2: DATOS DE CONTACTO ──────────────────────── */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b]">
                  Datos de Contacto
                </label>
                <p className="text-xs text-[#86868b] mt-1">
                  Todos los campos son opcionales.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                  Proveedor / Empresa
                </label>
                <input
                  placeholder="Ej: Gestoría García S.L."
                  value={formData.providerName}
                  onChange={(e) => set("providerName", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="600 000 000"
                    value={formData.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formData.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                  Dirección
                </label>
                <input
                  placeholder="Dirección del servicio"
                  value={formData.address}
                  onChange={(e) => set("address", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                    Horario
                  </label>
                  <input
                    placeholder="Lun–Vie 9:00–18:00"
                    value={formData.schedule}
                    onChange={(e) => set("schedule", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                    Precio
                  </label>
                  <input
                    placeholder="Gratuito para empleados"
                    value={formData.price}
                    onChange={(e) => set("price", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#86868b] ml-1 mb-1 block">
                  Enlace externo
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.externalUrl}
                  onChange={(e) => set("externalUrl", e.target.value)}
                  className={inputClass}
                />
              </div>
            </section>

            {/* ── SUBMIT ────────────────────────────────────────────── */}
            <div className="pb-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold hover:bg-[#0077ed] transition-all disabled:opacity-60 text-base"
              >
                {loading ? "Publicando..." : "Publicar Servicio"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
