'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_ROUTES } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

const SUGGESTED = [
    '¿Qué servicios tengo disponibles?',
    '¿Qué cursos puedo hacer?',
    '¿Cómo contacto con seguridad?',
    /*'¿Qué documentos tengo accesibles?',*/
];

const WELCOME: Message = {
    id: 'welcome',
    role: 'assistant',
    content: '¡Hola! 👋 Soy el asistente de Atalayas. Puedo ayudarte con información sobre servicios, cursos y documentos del polígono. ¿En qué te puedo ayudar?',
    timestamp: new Date(),
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([WELCOME]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Scroll al fondo cuando llega un mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Focus al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 120);
            setHasUnread(false);
        }
    }, [isOpen]);

    // ── Enviar ─────────────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        // Reset textarea height
        if (inputRef.current) inputRef.current.style.height = 'auto';
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Historial para la API: excluimos el mensaje de bienvenida local
            const history = [...messages, userMsg]
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch(API_ROUTES.CHATBOT.SEND, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ messages: history }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const assistantMsg: Message = {
                id: `a-${Date.now()}`,
                role: 'assistant',
                content: data.reply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMsg]);
            if (!isOpen) setHasUnread(true);

        } catch (err) {
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: 'Ha ocurrido un error. Por favor inténtalo de nuevo o contacta con info@atalayas.com.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const clearChat = () => setMessages([{ ...WELCOME, id: 'welcome-' + Date.now(), timestamp: new Date() }]);

    const showSuggestions = messages.length <= 1 && !isLoading;

    return (
        <>
            {/* ── FAB ────────────────────────────────────────────────────────────── */}
            <button
                onClick={() => setIsOpen(v => !v)}
                aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente'}
                className="fixed bottom-6 right-6 z-1000 w-14 h-14 rounded-full border-none cursor-pointer flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #0071e3, #0051a3)', boxShadow: '0 4px 20px rgba(0,113,227,0.45)' }}
            >
                <span className="transition-all duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    {isOpen ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3 3l12 12M15 3L3 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="30" height="30" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
                            <rect x="35" y="0" width="30" height="8" rx="4" fill="white" opacity="0.5" />
                            <rect x="45" y="4" width="10" height="10" rx="2" fill="white" opacity="0.7" />
                            <rect x="10" y="14" width="80" height="60" rx="16" fill="white" opacity="0.95" />
                            <rect x="20" y="26" width="22" height="18" rx="9" fill="#0071e3" />
                            <circle cx="31" cy="35" r="6" fill="#003d99" />
                            <circle cx="34" cy="32" r="2" fill="white" />
                            <rect x="58" y="26" width="22" height="18" rx="9" fill="#0071e3" />
                            <circle cx="69" cy="35" r="6" fill="#003d99" />
                            <circle cx="72" cy="32" r="2" fill="white" />
                            <rect x="28" y="55" width="44" height="8" rx="4" fill="#0071e3" opacity="0.3" />
                            <rect x="34" y="57" width="8" height="4" rx="2" fill="#0071e3" opacity="0.7" />
                            <rect x="46" y="57" width="8" height="4" rx="2" fill="#0071e3" opacity="0.7" />
                            <rect x="58" y="57" width="8" height="4" rx="2" fill="#0071e3" opacity="0.7" />
                            <rect x="0" y="24" width="14" height="36" rx="7" fill="white" opacity="0.7" />
                            <rect x="86" y="24" width="14" height="36" rx="7" fill="white" opacity="0.7" />
                            <rect x="20" y="74" width="60" height="50" rx="12" fill="white" opacity="0.95" />
                            <rect x="30" y="80" width="18" height="38" rx="9" fill="#0071e3" />
                            <rect x="52" y="80" width="18" height="38" rx="9" fill="#0071e3" />
                        </svg>
                    )}
                </span>

                {/* Badge de no leídos */}
                {hasUnread && !isOpen && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
                )}
            </button>

            {/* ── PANEL ──────────────────────────────────────────────────────────── */}
            <div
                ref={panelRef}
                className="fixed bottom-22 right-6 z-999 flex flex-col overflow-hidden rounded-[22px] bg-white"
                style={{
                    width: '380px',
                    maxWidth: 'calc(100vw - 32px)',
                    height: '560px',
                    maxHeight: 'calc(100vh - 116px)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                    pointerEvents: isOpen ? 'all' : 'none',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0071e3, #0051a3)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: 'rgba(255,255,255,0.18)' }}>
                            <svg width="30" height="30" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
                                <rect x="35" y="0" width="30" height="8" rx="4" fill="white" opacity="0.5" />
                                <rect x="45" y="4" width="10" height="10" rx="2" fill="white" opacity="0.7" />
                                <rect x="10" y="14" width="80" height="60" rx="16" fill="white" opacity="0.95" />
                                <rect x="20" y="26" width="22" height="18" rx="9" fill="#0071e3" />
                                <circle cx="31" cy="35" r="6" fill="#003d99" />
                                <circle cx="34" cy="32" r="2" fill="white" />
                                <rect x="58" y="26" width="22" height="18" rx="9" fill="#0071e3" />
                                <circle cx="69" cy="35" r="6" fill="#003d99" />
                                <circle cx="72" cy="32" r="2" fill="white" />
                                <rect x="28" y="55" width="44" height="8" rx="4" fill="#0071e3" opacity="0.3" />
                                <rect x="34" y="57" width="8" height="4" rx="2" fill="#0071e3" opacity="0.7" />
                                <rect x="46" y="57" width="8" height="4" rx="2" fill="#0071e3" opacity="0.7" />
                                <rect x="58" y="57" width="8" height="4" rx="2" fill="#0071e3" opacity="0.7" />
                                <rect x="0" y="24" width="14" height="36" rx="7" fill="white" opacity="0.7" />
                                <rect x="86" y="24" width="14" height="36" rx="7" fill="white" opacity="0.7" />
                                <rect x="20" y="74" width="60" height="50" rx="12" fill="white" opacity="0.95" />
                                <rect x="30" y="80" width="18" height="38" rx="9" fill="#0071e3" />
                                <rect x="52" y="80" width="18" height="38" rx="9" fill="#0071e3" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm m-0 leading-tight">Asistente Atalayas</p>
                            <p className="text-xs m-0 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                En línea
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={clearChat}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
                        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                    >
                        Nueva conversación
                    </button>
                </div>

                {/* MENSAJES */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {/* Burbuja de mensaje */}
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all"
                                    style={{
                                        background: 'rgba(0,113,227,0.08)', // Azul muy sutil
                                        border: '1px solid rgba(0,113,227,0.12)' // Borde casi invisible para dar definición
                                    }}>

                                    {/* Icono de Chispa (Sparkle) */}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2L14.8 8.5L22 11L14.8 13.5L12 20L9.2 13.5L2 11L9.2 8.5L12 2Z"
                                            fill="#0071e3"
                                            stroke="#0071e3"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* Chispa pequeña secundaria para darle más dinamismo */}
                                        <path
                                            d="M19 3L19.7 4.7L21.5 5.2L19.7 5.7L19 7.5L18.3 5.7L16.5 5.2L18.3 4.7L19 3Z"
                                            fill="#0071e3"
                                            opacity="0.6"
                                        />
                                    </svg>

                                </div>
                            )}

                            <div
                                className="text-sm leading-relaxed markdown-container"
                                style={{
                                    maxWidth: '78%',
                                    padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: msg.role === 'user' ? '#0071e3' : '#f5f5f7',
                                    color: msg.role === 'user' ? '#fff' : '#1d1d1f',
                                    wordBreak: 'break-word',
                                }}
                            >
                                <ReactMarkdown
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a {...props} className="font-bold underline hover:opacity-70"
                                                style={{ color: msg.role === 'user' ? '#fff' : '#0071e3' }} />
                                        )
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>

                                <div className="text-[10px] mt-1 text-right"
                                    style={{ opacity: 0.55, color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : '#86868b' }}>
                                    {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Sugerencias */}
                    {showSuggestions && (
                        <div className="mt-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#86868b] mb-2">
                                Preguntas frecuentes
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {SUGGESTED.map(q => (
                                    <button key={q} onClick={() => sendMessage(q)}
                                        className="text-left text-[13px] font-medium text-[#1d1d1f] px-3.5 py-2.5 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] cursor-pointer transition-colors"
                                        onMouseOver={e => (e.currentTarget.style.background = '#ebebf0')}
                                        onMouseOut={e => (e.currentTarget.style.background = '#f5f5f7')}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-sm"
                                style={{ background: 'rgba(0,113,227,0.1)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2L14.8 8.5L22 11L14.8 13.5L12 20L9.2 13.5L2 11L9.2 8.5L12 2Z"
                                            fill="#0071e3"
                                            stroke="#0071e3"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* Chispa pequeña secundaria para darle más dinamismo */}
                                        <path
                                            d="M19 3L19.7 4.7L21.5 5.2L19.7 5.7L19 7.5L18.3 5.7L16.5 5.2L18.3 4.7L19 3Z"
                                            fill="#0071e3"
                                            opacity="0.6"
                                        />
                                    </svg></div>
                            <div className="flex gap-1 items-center px-4 py-3 rounded-[18px] rounded-bl-lg"
                                style={{ background: '#f5f5f7' }}>
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#86868b] inline-block"
                                        style={{ animation: 'chatBounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <div className="px-3 pb-3 pt-2 shrink-0 border-t border-black/6 bg-white">
                    <div className="flex items-end gap-2 px-3 py-2 rounded-2xl border-2 border-transparent bg-[#f5f5f7] transition-all"
                        style={{ borderColor: 'transparent' }}
                        onFocusCapture={e => (e.currentTarget.style.borderColor = '#0071e3')}
                        onBlurCapture={e => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu pregunta..."
                            disabled={isLoading}
                            rows={1}
                            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[#1d1d1f] leading-relaxed placeholder:text-[#c7c7cc]"
                            style={{ maxHeight: '96px', fontFamily: 'inherit', overflowY: 'auto', padding: 0 }}
                            onInput={e => {
                                const el = e.currentTarget;
                                el.style.height = 'auto';
                                el.style.height = Math.min(el.scrollHeight, 96) + 'px';
                            }}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            className="w-8 h-8 rounded-[10px] border-none flex items-center justify-center shrink-0 cursor-pointer transition-all"
                            style={{
                                background: input.trim() && !isLoading ? '#0071e3' : '#e8e8ed',
                                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1.5 7L12.5 1.5L7 12.5V7.5L1.5 7Z"
                                    fill={input.trim() && !isLoading ? 'white' : '#86868b'} />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-[#86868b] text-center mt-2 mb-0">
                        Asistente IA · Tenga en cuenta que puede cometer errores.
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
          .markdown-container p{
          margin: 0;
          }

          .markdown-container ul, .markdown-container ol {
          margin: 4px 0;
          padding-left: 20px;
          }
      `}</style>
        </>
    );
}