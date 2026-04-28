'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const PREMIUM_GRADIENT_COLS = "from-teal-400 via-amber-400 to-orange-500";

const ANUNCIOS = [
  {
    id: 1,
    title: "Inauguración de la Nueva Zona de Coworking",
    desc: "Descubre el nuevo espacio diseñado para fomentar la colaboración y la creatividad en el Hub de Atalayas.",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    link: "/dashboard/employee/news/1"
  },
  {
    id: 2,
    title: "Afterwork de Networking: Edición Primavera",
    desc: "Conecta con otros profesionales del ecosistema en nuestra terraza el próximo jueves a las 18:00.",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
    link: "/dashboard/employee/news/2"
  }
];

export default function EmployeeDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextSlide = useCallback(() => {
    if (ANUNCIOS.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % ANUNCIOS.length);
  }, []);

  const prevSlide = useCallback(() => {
    if (ANUNCIOS.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? ANUNCIOS.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (!mounted || ANUNCIOS.length <= 1) return;
    const timer = setTimeout(() => {
      nextSlide();
    }, 10000);
    return () => clearTimeout(timer);
  }, [currentIndex, mounted, nextSlide]);

  if (!mounted) return null;

  const actualAnuncio = ANUNCIOS[currentIndex];

  // ── CONFIGURACIÓN DE LOS BOTONES DE ABAJO ──
  const quickActions = [
    { 
      title: 'Mis Cursos', 
      desc: 'Continúa con tu progreso actual.', 
      icon: 'bi-journal-bookmark-fill', 
      color: 'text-primary', 
      href: '/dashboard/employee/courses' 
    },
    { 
      title: 'Formación', // <-- CAMBIO REALIZADO AQUÍ
      desc: 'Explora el catálogo completo de cursos.', 
      icon: 'bi-mortarboard-fill', 
      color: 'text-secondary', 
      href: '/dashboard/employee/onboarding' 
    },
    { 
      title: 'Documentos', 
      desc: 'Manuales, logos y normativas.', 
      icon: 'bi-file-earmark-text-fill', 
      color: 'text-primary', 
      href: '/dashboard/documents' 
    },
    { 
      title: 'Comunidad', 
      desc: 'Conecta con otros empleados.', 
      icon: 'bi-people-fill', 
      color: 'text-secondary', 
      href: '/dashboard/employee/community' 
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <Sidebar role="EMPLOYEE" />

      <motion.main 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 overflow-y-auto flex flex-col relative no-scrollbar"
      >
        <PageHeader 
          title="Mi Panel"
          description="Bienvenido a tu espacio de trabajo. Mantente al día con las noticias y recursos corporativos."
          icon={<i className="bi bi-person-workspace"></i>}
        />

        <div className="p-6 lg:p-10 flex-1 space-y-8">
          
          {/* ── CARRUSEL ── */}
          {ANUNCIOS.length > 0 && actualAnuncio && (
            <section className="space-y-4">
              <div className="px-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">
                  Destacados de la empresa
                </h2>
              </div>

              <div className={`relative p-[1.5px] rounded-[3.5rem] transition-all duration-500 bg-transparent hover:bg-gradient-to-r ${PREMIUM_GRADIENT_COLS} shadow-2xl group`}>
                <Link 
                  href={actualAnuncio.link}
                  className="relative block w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/8] rounded-[calc(3.5rem-1.5px)] overflow-hidden bg-card cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                        style={{ backgroundImage: `url(${actualAnuncio.img})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent z-10" />
                      
                      <div className="absolute inset-0 z-20 flex flex-col justify-center p-10 md:p-20">
                        <div className="max-w-3xl space-y-4">
                          <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-white">
                            {actualAnuncio.title}
                          </h3>
                          <p className="text-white/70 text-base md:text-lg font-medium max-w-xl leading-relaxed">
                            {actualAnuncio.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <button onClick={(e) => { e.preventDefault(); prevSlide(); }} className="absolute left-1 inset-y-0 z-30 flex items-center bg-transparent border-none text-white/20 hover:text-white transition-all duration-300">
                    <i className="bi bi-chevron-left text-7xl scale-y-[1.5] scale-x-[0.5] font-thin"></i>
                  </button>

                  <button onClick={(e) => { e.preventDefault(); nextSlide(); }} className="absolute right-1 inset-y-0 z-30 flex items-center bg-transparent border-none text-white/20 hover:text-white transition-all duration-300">
                    <i className="bi bi-chevron-right text-7xl scale-y-[1.5] scale-x-[0.5] font-thin"></i>
                  </button>

                  <div className="absolute bottom-10 right-16 z-20 flex items-center gap-3">
                     {ANUNCIOS.map((_, i) => (
                       <div key={i} className={`transition-all duration-500 rounded-full ${i === currentIndex ? 'w-12 h-1.5 bg-white' : 'w-2 h-1.5 bg-white/30'}`} />
                     ))}
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* ── GRID DE CONTENIDO ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* HERRAMIENTAS / ACCESOS RÁPIDOS (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold tracking-tight px-2 text-foreground">Accesos Rápidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {quickActions.map((item, i) => (
                  <Link key={i} href={item.href} className="p-8 bg-card border border-border rounded-[2.5rem] hover:border-primary/50 hover:shadow-xl transition-all group flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground tracking-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ACTIVIDAD (1/3) */}
            <div className="space-y-6 pb-10">
              <h2 className="text-xl font-bold tracking-tight px-2 text-foreground">Última Actividad</h2>
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
                {[
                  { title: 'Reunión General', time: 'Hoy, 16:30', desc: 'Resultados trimestrales.' },
                  { title: 'Curso Completado', time: 'Ayer', desc: 'Has finalizado "Seguridad".' },
                  { title: 'Nuevo Documento', time: '24 Mar', desc: 'Calendario laboral.' },
                ].map((note, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-muted hover:border-primary transition-colors">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-background border-2 border-primary"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{note.time}</p>
                    <h5 className="text-sm font-bold text-foreground leading-none mb-2">{note.title}</h5>
                    <p className="text-xs text-muted-foreground leading-snug">{note.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.main>
    </div>
  );
}