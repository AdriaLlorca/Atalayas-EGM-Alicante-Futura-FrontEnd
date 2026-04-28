"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import SearchInput from "@/components/ui/Searchbar";
import { API_ROUTES } from "@/lib/utils";
import { useSearchParams } from 'next/navigation';


export default function EmployeeServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "COMPANY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const fromTaskId = searchParams.get('fromTask');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) return;

        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setServices(data);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
  const autoConfirmTask = async () => {
    if (fromTaskId) {
      try {
        const token = localStorage.getItem("token");
        await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taskId: fromTaskId, done: true }),
        });
        console.log("Tarea de onboarding completada automáticamente");
      } catch (err) {
        console.error("Error al autocompletar:", err);
      }
    }
  };

  autoConfirmTask();
}, [fromTaskId]);

  const filtered = services.filter((s) => {
    const matchesSearch = s.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filter === "PUBLIC") return matchesSearch && s.isPublic;
    if (filter === "COMPANY") return matchesSearch && !s.isPublic;
    return matchesSearch;
  });

  const sortedServices = [...filtered].sort((a, b) => {
    if (a.isPublic && !b.isPublic) return -1;
    if (!a.isPublic && b.isPublic) return 1;
    return a.title.localeCompare(b.title);
  });

  if (!currentUser) return null;

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Servicios
            </h1>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar servicios..."
            />
          </div>

          {/* CHIPS DE FILTRADO */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["ALL", "PUBLIC", "COMPANY"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === type
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-white text-[#86868b] border border-gray-200"
                }`}
              >
                {type === "ALL" ? (
                  "Todos"
                ) : type === "PUBLIC" ? (
                  <span className="flex items-center gap-2">
                    <i className="bi bi-globe text-green-400"></i> Públicos
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="bi bi-building-fill text-blue-400"></i> Mi
                    empresa{" "}
                  </span>
                )}{" "}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/dashboard/employee/services/${service.id}`}
                >
                  <div className="group bg-white rounded-[2rem] border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-[0.98]">
                    {/* 1. CONTENEDOR DE IMAGEN: Forzamos ratio 16:9 o 4:3 */}
                    <div className="relative w-full aspect-video overflow-hidden bg-gray-100 border-b border-gray-100">
                      {service.mediaUrl && (
                        <img
                          src={service.mediaUrl}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>

                    {/* 2. CONTENIDO: Padding reducido para evitar "mucho espacio" */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Título: Altura mínima para 2 líneas máximo */}
                      <h3 className="text-lg font-bold text-[#1d1d1f] mb-2 group-hover:text-[#0071e3] transition-colors line-clamp-2 h-14 overflow-hidden">
                        {service.title}
                      </h3>

                      {/* 3. FOOTER: Empujado al final */}
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${service.isPublic ? "text-green-600" : "text-gray-400"}`}
                        >
                          {service.isPublic ? "🌐 Público" : "🔒 Privado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
