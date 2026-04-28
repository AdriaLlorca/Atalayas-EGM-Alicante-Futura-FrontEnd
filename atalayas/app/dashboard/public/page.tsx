'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  isPublic: boolean;
  serviceType: 'INFO' | 'BOOKING' | 'ANNOUNCEMENT';
  description?: string;
  mediaUrl?: string;
}

export default function PublicDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [coursesRes, servicesRes] = await Promise.all([
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.SERVICES.GET_ALL, { headers })
        ]);

        const coursesData = await coursesRes.json();
        const servicesData = await servicesRes.json();

        // Validamos que la respuesta sea exitosa y sea un array
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar role="PUBLIC" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido al polígono</h1>
          <p className="text-gray-500 text-sm">Explora los cursos y servicios disponibles</p>
        </div>

        {/* Cursos públicos */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Cursos disponibles</h2>
            <a href="/dashboard/public/courses" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              Ver todos →
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No hay cursos públicos disponibles</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <a
                  key={course.id}
                  href={`/dashboard/public/courses/${course.id}`}
                  className="p-4 bg-white/3 border border-white/8 rounded-xl hover:bg-white/6 hover:border-blue-500/30 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-blue-400 text-lg">📚</span>
                  </div>
                  <h3 className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors mb-1">
                    {course.title}
                  </h3>
                  <span className="text-xs text-green-500">🌐 Curso público</span>
                </a>
              ))}
            </div>
          )}
        </div>
        {/* Servicios disponibles */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mt-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Servicios disponibles</h2>
            <a href="/dashboard/public/courses" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              Ver todos →
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No hay servicios públicos disponibles</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <a
                  key={service.id}
                  href={`/dashboard/public/courses/${service.id}`}
                  className="p-4 bg-white/3 border border-white/8 rounded-xl hover:bg-white/6 hover:border-blue-500/30 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-blue-400 text-lg">📚</span>
                  </div>
                  <h3 className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors mb-1">
                    {service.title}
                  </h3>
                  <span className="text-xs text-green-500">🌐 Servicio público</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
