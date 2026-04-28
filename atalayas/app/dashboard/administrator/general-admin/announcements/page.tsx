'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  Company?: { id: string; name: string } | null;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(API_ROUTES.ANNOUNCEMENTS.GET_ALL, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_ROUTES.ANNOUNCEMENTS.GET_ALL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert('No se pudo eliminar el anuncio.');
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f7]"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <nav className="flex items-center gap-2 text-sm text-[#86868b] mb-4">
                <Link href="/dashboard/administrator/general-admin" className="hover:text-[#0071e3] transition-colors">
                  Dashboard
                </Link>
                <span className="opacity-50">/</span>
                <span className="text-[#1d1d1f] font-medium">Anuncios</span>
              </nav>
              <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Anuncios</h1>
              <p className="text-[#86868b] mt-1 text-base">Gestiona los comunicados de la plataforma</p>
            </div>
            <Link
              href="/dashboard/administrator/general-admin/announcements/new"
              className="bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ed] transition-all shadow-sm whitespace-nowrap"
            >
              + Nuevo anuncio
            </Link>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                      Anuncio
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                      Visibilidad
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                      Fecha
                    </th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-6 bg-gray-50/40" />
                      </tr>
                    ))
                  ) : announcements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-[#86868b] text-sm">
                        No hay anuncios publicados todavía.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((ann) => (
                      <tr key={ann.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 max-w-sm">
                          <p className="font-semibold text-[#1d1d1f] text-sm mb-0.5">{ann.title}</p>
                          <p className="text-[#86868b] text-xs line-clamp-1">{ann.content}</p>
                        </td>
                        <td className="px-6 py-4">
                          {ann.isPublic ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700">
                              Global
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700">
                              {ann.Company?.name ?? 'Empresa'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#86868b] text-xs whitespace-nowrap">
                          {formatDate(ann.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(ann.id)}
                            disabled={deleting === ann.id}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {deleting === ann.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
