// components/ui/CompanyDropdown.tsx
'use client';

import { useState } from 'react';
import { useEffect } from 'react';

interface CompanyDropdownProps {
  companies: string[];
  selected: string;
  onChange: (company: string) => void;
}

export default function CompanyDropdown({ companies, selected, onChange }: CompanyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c =>{
   if(c==='EGM Atalayas') return false;
   return c === 'PUBLIC' || c.toLowerCase().includes(search.toLowerCase())
  });

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.relative')) setOpen(false);
    };
    if (open) window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [open]);

  return (
    <div className="relative mb-8">
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm font-semibold text-[#1d1d1f] hover:border-gray-400 transition-all w-64"
      >
        <span>{selected === 'PUBLIC' ? '🌐 Público' : `🏭 ${selected}`}</span>
        <span className="ml-auto text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-14 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-72 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              className="w-full text-sm outline-none px-3 py-2 bg-[#f5f5f7] rounded-xl"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.slice(0,10).map((company) => (
              <button
                key={company}
                onClick={() => { onChange(company); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-5 py-3 text-sm hover:bg-[#f5f5f7] transition-colors ${
                  selected === company ? 'font-bold text-[#0071e3]' : 'text-[#1d1d1f]'
                }`}
              >
                {company === 'PUBLIC' ? '🌐 Público' : `🏭 ${company}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}