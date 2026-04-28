'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Aurora from '@/components/Aurora'; 
import CountUp from '@/components/CountUp'; 

const PREMIUM_GRADIENT = "bg-gradient-to-r from-teal-400 via-amber-400 to-orange-500";

const ATALAYAS_INFO = [
  {
    title: "Hub de Innovación",
    desc: "Un centro neurálgico diseñado para que la Pyme alicantina acceda a tecnología punta y servicios de valor añadido.",
    img: "/images/aerial.jpg",
    color: "text-teal-400"
  },
  {
    title: "+200 Empresas",
    desc: "Un ecosistema vibrante donde medianas y grandes empresas comparten un espacio de crecimiento y sinergia real.",
    img: "/images/empresas.jpg",
    color: "text-amber-400"
  },
  {
    title: "Talento y Vivero",
    desc: "Fomentamos la formación dual y el acceso a una bolsa de empleo especializada en el sector industrial y tecnológico.",
    img: "/images/talento.jpg",
    color: "text-orange-500"
  },
  {
    title: "Conectividad 4.0",
    desc: "Infraestructura de alta disponibilidad con fibra simétrica y monitorización avanzada para la industria del futuro.",
    img: "/images/infraestructura.jpg",
    color: "text-indigo-400"
  }
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const iconRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    gsap.registerPlugin(ScrollTrigger);

    const savedTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
    const initialTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(initialTheme);
    if (initialTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // Mantenemos el scroll suave fluido
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    const raf = (time: number) => { 
      lenis.raf(time * 1000); 
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    gsap.to(iconRef.current, {
        rotation: isDark ? 180 : 0,
        scale: 0,
        duration: 0.25,
        onComplete: () => {
            setIsDark(newTheme);
            if (newTheme) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            document.cookie = `theme=${newTheme ? 'dark' : 'light'}; path=/; max-age=31536000`;
            
            gsap.to(iconRef.current, {
                scale: 1,
                rotation: isDark ? 360 : 180,
                duration: 0.5,
                ease: "elastic.out(1, 0.6)"
            });
        }
    });
  };

  if (!mounted) return null;

  return (
    <div className="bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-orange-500/30">
      
      {/* ── BANNER (NAV) ── */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-2 rounded-full border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-3xl shadow-xl transition-all duration-500">
        <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <div ref={iconRef} className="w-5 h-5 flex items-center justify-center">
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <circle cx="12" cy="12" r="5" fill="currentColor"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </button>
        <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-2"></div>
        <Link href="/login" className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest bg-foreground text-background rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg">
          Acceso Portal
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-8 lg:px-24 pt-32 pb-20 overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 opacity-60">
            <Aurora colorStops={isDark ? ["#2DD4BF", "#FBBF24", "#6366F1"] : ["#00897b", "#f97316", "#4338ca"]} amplitude={1.2} blend={0.6} />
        </div>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-end px-24 hidden lg:flex z-10">
          <div className="w-[480px] h-[600px] rounded-[3rem] backdrop-blur-3xl bg-white/40 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-2xl relative group overflow-hidden pointer-events-auto transition-all duration-500 p-12 flex flex-col gap-10">
             <div className="relative z-10 flex flex-col gap-10">
                <div className="space-y-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">Ecosistema Activo</span>
                    <h3 className="text-4xl font-extrabold text-foreground tracking-tighter leading-tight">Servicios de <br /> Impulso.</h3>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">Recursos estratégicos diseñados para potenciar la competitividad de la mediana empresa en Atalayas.</p>
                </div>
                <div className="space-y-5">
                    {[
                        { title: 'Capacitación', desc: 'Formación técnica y talento dual.', icon: 'bi-mortarboard' },
                        { title: 'Subvenciones', desc: 'Gestión de ayudas y fondos europeos.', icon: 'bi-bank' },
                        { title: 'Networking', desc: 'Conexiones industriales directas.', icon: 'bi-people' },
                        { title: 'Digitalización', desc: 'Transformación y tecnología 4.0.', icon: 'bi-cpu' }
                    ].map((serv, i) => (
                        <div key={i} className="flex items-start gap-4 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0">
                                <i className={`bi ${serv.icon} text-teal-600 dark:text-teal-400 text-sm`}></i>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-foreground uppercase tracking-wider">{serv.title}</p>
                                <p className="text-[11px] text-muted-foreground font-medium">{serv.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 items-center z-10">
          <div className="text-center lg:text-left pr-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Vivero de Empresas y Talento
            </div>
            <div className="flex flex-col gap-1 mb-10">
              <h1 className="text-6xl lg:text-[100px] font-black tracking-tighter leading-tight text-foreground">Atalayas</h1>
              <h2 className="text-3xl lg:text-[55px] font-black tracking-tighter leading-tight text-muted-foreground/30 dark:text-white/30">Ecosistema de</h2>
              <h2 className={`text-5xl lg:text-[90px] font-black tracking-tighter leading-tight text-transparent bg-clip-text pb-2 ${PREMIUM_GRADIENT}`}>Innovación.</h2>
            </div>
            <p className="max-w-md mx-auto lg:mx-0 text-xl font-medium text-muted-foreground leading-relaxed mb-12">Mucho más que un espacio industrial. Somos el vivero donde las medianas empresas alicantinas se conectan e innovan.</p>
            <Link href="/register" className="inline-block px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-orange-500/20">Registrar mi Empresa</Link>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID PURO Y FUNCIONAL ── */}
      <div className="relative w-full py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {ATALAYAS_INFO.map((item, i) => {
            const colSpan = i === 0 || i === 3 ? 'md:col-span-2' : 'md:col-span-1';

            return (
              <div 
                key={i} 
                className={`${colSpan} relative h-full w-full rounded-[2rem] overflow-hidden group shadow-2xl bg-black`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ 
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%), url(${item.img})` 
                  }}
                />
                
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-500" />
                
                <div className="relative z-10 flex flex-col justify-end h-full w-full p-8 md:p-10 pointer-events-none">
                  <span className={`block text-[10px] font-black uppercase tracking-[0.5em] mb-4 ${item.color}`}>
                    Impulso Corporativo
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4">
                    {item.title === "+200 Empresas" ? (
                      <div className="flex items-center gap-3">
                        <span>+</span>
                        <CountUp 
                          from={0} 
                          to={200} 
                          duration={1.5} 
                          className="text-white" 
                          onStart={() => {}} 
                          onEnd={() => {}} 
                        />
                        <span className="text-xl md:text-3xl mt-1">Empresas</span>
                      </div>
                    ) : (
                      item.title
                    )}
                  </h2>
                  
                  <p className="text-sm md:text-base text-white/60 font-medium max-w-xl leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER GENÉRICO ── */}
      <footer className="relative w-full border-t border-black/10 dark:border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo y Copyright */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tighter text-foreground">Atalayas</h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              © {new Date().getFullYear()} Atalayas Ecosistema de Innovación. <br className="md:hidden" /> Todos los derechos reservados.
            </p>
          </div>
          
          {/* Enlaces Legales */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Términos</Link>
            <Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Contacto</Link>
          </div>

          {/* Redes Sociales */}
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-orange-500 transition-all">
              <i className="bi bi-linkedin"></i>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-orange-500 transition-all">
              <i className="bi bi-twitter-x"></i>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-orange-500 transition-all">
              <i className="bi bi-instagram"></i>
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
}