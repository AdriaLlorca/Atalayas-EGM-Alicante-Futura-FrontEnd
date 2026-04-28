'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/lib/utils';
import Sidebar from '@/components/ui/Sidebar';
import SearchBar from '@/components/ui/Searchbar';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

interface CompanyRequest {
  id: string;
  companyName: string;
  cif: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  activity?: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' ;
  rejectReason?: string;
  created_at: string;
  archivedAt?: string | null;
}

const statusConfig = {
  PENDING: { label: 'Pendientes', color: '#ff9500', bg: 'rgba(255,149,0,0.1)' },
  APPROVED: { label: 'Aprobadas', color: '#34c759', bg: 'rgba(52,199,89,0.1)' },
  REJECTED: { label: 'Rechazadas', color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' },
  ARCHIVED: { label: 'Archivadas', color: '#86868b', bg: 'rgba(134,134,139,0.1)' },
};

export default function CompanyRequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompanyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'>('PENDING');
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchRequests = async () => {
    setRequests([]);
    setLoading(true);
    try {
      const url = filter === 'ARCHIVED'
        ? API_ROUTES.COMPANY_REQUESTS.GET_ARCHIVED
        : API_ROUTES.COMPANY_REQUESTS.GET_ALL
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.GET_ALL, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setPendingCount(Array.isArray(data) ? data.filter((r: any) => r.status === 'PENDING').length : 0);
    } catch { }
  };

  useEffect(() => { fetchRequests(); fetchPendingCount() }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.APPROVE(id), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Error al aprobar');
      await fetchRequests();
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.REJECT(selected.id), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectReason }),
      });
      if (!res.ok) throw new Error('Error al rechazar');
      await fetchRequests();
      setSelected(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = (filter === 'ALL' || filter === 'ARCHIVED' ? requests : requests.filter(r => r.status === filter))
    .filter(r =>
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cif.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont }}>
      <Sidebar role="GENERAL_ADMIN" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: '#1d1d1f', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
                Solicitudes de empresa
              </h1>
              <p style={{ color: '#86868b', fontSize: '14px', margin: 0 }}>
                Gestiona las solicitudes de alta de nuevas empresas
              </p>
            </div>
            {pendingCount > 0 && (
              <div style={{ background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: '20px', padding: '6px 14px' }}>
                <span style={{ color: '#ff9500', fontSize: '13px', fontWeight: 500 }}>
                  {pendingCount} pendiente {pendingCount > 1 ? 's' : ''}
                </span>
              </div>
            )}

          </div>
          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: filter === f ? '#1d1d1f' : '#f5f5f7',
                    color: filter === f ? '#fff' : '#424245',
                    fontSize: '13px',
                    fontWeight: filter === f ? 500 : 400,
                    cursor: 'pointer',
                    fontFamily: appleFont,
                    transition: 'all 0.15s',
                  }}
                >
                  {f === 'ALL' ? 'Todas' : statusConfig[f].label}
                </button>
              ))}
            </div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar solicitud..."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', flex: 1, overflow: 'hidden' }}>
          {/* Lista */}
          <div style={{ padding: '24px 32px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '90px', background: '#fff', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>📋</p>
                <p style={{ color: '#86868b', fontSize: '14px' }}>No hay solicitudes {filter !== 'ALL' ? statusConfig[filter].label.toLowerCase() : ''}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map((req) => {
                  const status = statusConfig[req.status];
                  const isSelected = selected?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelected(isSelected ? null : req)}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #0071e3' : '1px solid transparent',
                        boxShadow: isSelected
                          ? '0 0 0 3px rgba(0,113,227,0.1)'
                          : '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '42px', height: '42px',
                          background: '#f5f5f7',
                          borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: '18px',
                        }}>
                          🏭
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: '#1d1d1f', fontSize: '15px', fontWeight: 600, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.companyName}
                          </p>
                          <p style={{ color: '#86868b', fontSize: '12px', margin: '0 0 2px' }}>
                            CIF: {req.cif} · {req.contactName}
                          </p>
                          <p style={{ color: '#b0b0b5', fontSize: '11px', margin: 0 }}>
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'}
                          </p>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: status.bg,
                        color: status.color,
                        fontSize: '12px',
                        fontWeight: 500,
                        flexShrink: 0,
                      }}>
                        {status.label.slice(0, -1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel detalle */}
          {selected && (
            <div style={{ overflowY: 'auto', borderLeft: '1px solid rgba(0,0,0,0.06)', background: '#fff', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
                  Detalle solicitud
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86868b', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              {/* Info empresa */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f5f5f7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>
                  🏭
                </div>
                <h3 style={{ color: '#1d1d1f', fontSize: '20px', fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
                  {selected.companyName}
                </h3>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px',
                  background: statusConfig[selected.status].bg,
                  color: statusConfig[selected.status].color,
                  fontSize: '12px', fontWeight: 500,
                }}>
                  {statusConfig[selected.status].label.slice(0, -1)}
                </span>
              </div>

              {/* Campos */}
              {[
                { label: 'CIF', value: selected.cif },
                { label: 'Actividad', value: selected.activity },
                { label: 'Dirección', value: selected.address },
                { label: 'Responsable', value: selected.contactName },
                { label: 'Email', value: selected.contactEmail },
                { label: 'Teléfono', value: selected.phone },
              ].filter(f => f.value).map((field) => (
                <div key={field.label} style={{ marginBottom: '14px' }}>
                  <p style={{ color: '#86868b', fontSize: '11px', fontWeight: 500, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {field.label}
                  </p>
                  <p style={{ color: '#1d1d1f', fontSize: '14px', margin: 0 }}>{field.value}</p>
                </div>
              ))}

              {/* Documento */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#86868b', fontSize: '11px', fontWeight: 500, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Documento acreditativo
                </p>
                <a
                  href={selected.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px',
                    background: '#f5f5f7',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: '#0071e3',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  <span>📄</span>
                  Ver documento
                  <span style={{ marginLeft: 'auto' }}>↗</span>
                </a>
              </div>

              {/* Motivo rechazo */}
              {selected.rejectReason && (
                <div style={{ background: 'rgba(255,59,48,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '24px' }}>
                  <p style={{ color: '#ff3b30', fontSize: '12px', fontWeight: 500, margin: '0 0 4px' }}>Motivo de rechazo</p>
                  <p style={{ color: '#1d1d1f', fontSize: '13px', margin: 0 }}>{selected.rejectReason}</p>
                </div>
              )}

              {/* Acciones */}
              {selected.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    disabled={actionLoading}
                    style={{
                      width: '100%', padding: '13px',
                      background: actionLoading ? '#86868b' : '#34c759',
                      color: '#fff', border: 'none',
                      borderRadius: '12px', fontSize: '14px',
                      fontWeight: 500, cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontFamily: appleFont,
                    }}
                  >
                    {actionLoading ? 'Procesando...' : '✓ Aprobar solicitud'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    style={{
                      width: '100%', padding: '13px',
                      background: 'rgba(255,59,48,0.08)',
                      color: '#ff3b30', border: 'none',
                      borderRadius: '12px', fontSize: '14px',
                      fontWeight: 500, cursor: 'pointer',
                      fontFamily: appleFont,
                    }}
                  >
                    ✕ Rechazar solicitud
                  </button>
                </div>
              )}

              {(selected.status === 'APPROVED' || selected.status === 'REJECTED') && !selected.archivedAt && (
                <button
                  onClick={async () => {
                    await fetch(API_ROUTES.COMPANY_REQUESTS.ARCHIVE(selected.id), {
                      method: 'PATCH',
                      headers: { Authorization: `Bearer ${getToken()}` },
                    });
                    await fetchRequests();
                    setSelected(null);
                  }}
                  style={{
                    width: '100%', padding: '13px',
                    background: '#f5f5f7', color: '#424245',
                    border: 'none', borderRadius: '12px',
                    fontSize: '14px', cursor: 'pointer',
                    fontFamily: appleFont, marginTop: '10px',
                  }}
                >
                  📦 Archivar solicitud
                </button>
              )}

              {selected.archivedAt && (
                <button
                onClick={async () => {
                  await fetch(API_ROUTES.COMPANY_REQUESTS.UNARCHIVE(selected.id), {
                    method: 'PATCH',
                    headers: {Authorization: `Bearer ${getToken()}`},
                  });
                  setFilter(selected.status as any);
                  await fetchRequests();
                  setSelected(null);
                }}
                style={{
                width: '100%', padding: '13px',
                background: '#f5f5f7', color: '#0071e3',
                border: 'none', borderRadius: '12px',
                fontSize: '14px', cursor: 'pointer',
                fontFamily: appleFont, marginTop: '10px',
              }}
              >
                📤 Desarchivar solicitud
              </button>
            )}
          </div>
          )}
        </div>

        {/* Modal rechazo */}
        {showRejectModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '24px',
          }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '420px', width: '100%' }}>
              <h3 style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, margin: '0 0 8px' }}>
                Rechazar solicitud
              </h3>
              <p style={{ color: '#86868b', fontSize: '13px', margin: '0 0 16px' }}>
                Indica el motivo del rechazo. Se enviará un email al solicitante.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motivo del rechazo..."
                rows={4}
                style={{
                  width: '100%', background: '#f5f5f7',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px', padding: '12px 14px',
                  fontSize: '14px', color: '#1d1d1f',
                  outline: 'none', resize: 'none',
                  fontFamily: appleFont, boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  style={{
                    flex: 1, padding: '12px',
                    background: '#f5f5f7', color: '#424245',
                    border: 'none', borderRadius: '12px',
                    fontSize: '14px', cursor: 'pointer',
                    fontFamily: appleFont,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                  style={{
                    flex: 1, padding: '12px',
                    background: !rejectReason.trim() ? '#86868b' : '#ff3b30',
                    color: '#fff', border: 'none',
                    borderRadius: '12px', fontSize: '14px',
                    fontWeight: 500,
                    cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: appleFont,
                  }}
                >
                  {actionLoading ? 'Rechazando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}