'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function DocumentsExplorerPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const searchParams = useSearchParams();
  const fromTaskId = searchParams.get('fromTask');



  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) return;
        
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        const res = await fetch(API_ROUTES.DOCUMENTS.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al cargar los documentos');
        
        const data = await res.json();
        const docsArray = Array.isArray(data) ? data : (data.data || []);
        setDocuments(docsArray);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  const handleDelete = async (docId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTES.DOCUMENTS.GET_ALL}/${docId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el documento');
      }

      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }

    } catch (err: any) {
      alert(err.message);
    }
  };

  const visibleDocs = documents.filter(doc => {
    if (currentUser?.role === 'ADMIN') {
      const isMyCompany = String(doc.companyId) === String(currentUser.companyId);
      if (!doc.isPublic && !isMyCompany) return false;
    }

    if (searchTerm.trim() !== '') {
      const normalizedTitle = doc.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normalizedSearch = searchTerm.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
      return normalizedTitle.includes(normalizedSearch);
    }

    return true; 
  });

  useEffect(() => {
    if (visibleDocs.length > 0 && (!selectedDoc || !visibleDocs.some(d => d.id === selectedDoc.id))) {
      setSelectedDoc(visibleDocs[0]); 
    } else if (visibleDocs.length === 0) {
      setSelectedDoc(null); 
    }
  }, [searchTerm, documents]); 

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar role={currentUser.role} />
      
      <main className="flex-1 flex overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: Lista de Documentos */}
        <div className="w-80 bg-card border-r border-border flex flex-col z-10 shadow-sm shrink-0">
          
          <div className="p-6 border-b border-border flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Documentos</h1>
              
              {/* Botón Nuevo Documento */}
              <Link href="/dashboard/documents/new">
                <button 
                  className="bg-primary text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                  title="Subir nuevo documento"
                >
                  <i className="bi bi-plus-lg text-lg"></i>
                </button>
              </Link>
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar archivo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl text-sm outline-none transition-all text-foreground"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <i className="bi bi-search"></i>
              </div>
            </div>
          </div>

          {/* Lista de archivos */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Cargando documentos...</div>
            ) : visibleDocs.length > 0 ? (
              visibleDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full flex flex-col text-left px-4 py-3.5 rounded-xl transition-all border ${
                    selectedDoc?.id === doc.id 
                      ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                      : 'bg-transparent border-transparent hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5 w-full">
                    <span className="font-semibold text-sm truncate pr-3">{doc.title}</span>
                    {doc.isPublic ? (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${selectedDoc?.id === doc.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}`}>Pub</span>
                    ) : (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${selectedDoc?.id === doc.id ? 'bg-black/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Priv</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${selectedDoc?.id === doc.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-10 text-center flex flex-col items-center">
                <i className="bi bi-file-earmark-x text-3xl text-muted-foreground/50 mb-2"></i>
                <span className="text-sm font-medium text-muted-foreground">No hay resultados</span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Visor del Documento */}
        <div className="flex-1 bg-background flex flex-col relative overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Barra superior del visor */}
              <div className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <i className="bi bi-file-earmark-text"></i>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground leading-tight">{selectedDoc.title}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {selectedDoc.isPublic ? 'Acceso Público' : 'Documento Privado'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <a 
                    href={selectedDoc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
                  >
                    <i className="bi bi-box-arrow-up-right"></i> Abrir pestaña
                  </a>
                  
                  {/* Botón Eliminar */}
                  {(currentUser.role === 'ADMIN' || currentUser.role === 'GENERAL_ADMIN') && (
                    <button 
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="flex items-center justify-center p-2 w-9 h-9 text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20 ml-1"
                      title="Eliminar documento"
                    >
                      <i className="bi bi-trash3 text-lg"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* ÁREA DEL DOCUMENTO A PANTALLA COMPLETA */}
              <div className="flex-1 w-full h-full bg-card overflow-hidden">
                <iframe 
                  src={selectedDoc.fileUrl} 
                  className="w-full h-full border-none block"
                  title={selectedDoc.title}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <i className="bi bi-folder2-open text-3xl opacity-50"></i>
              </div>
              <p className="text-lg font-bold text-foreground mb-1">Visor de Documentos</p>
              <p className="text-sm">Selecciona un documento del panel izquierdo</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}