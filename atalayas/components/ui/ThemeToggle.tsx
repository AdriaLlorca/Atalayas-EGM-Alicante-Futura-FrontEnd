'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Comprobar el tema al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <button 
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-all">
        <i className={`bi ${isDark ? 'bi-moon-stars-fill text-indigo-400' : 'bi-sun-fill text-amber-500'} text-lg`}></i>
      </div>
      <span className="font-bold text-sm">
        {isDark ? 'Modo Oscuro' : 'Modo Claro'}
      </span>
    </button>
  );
}