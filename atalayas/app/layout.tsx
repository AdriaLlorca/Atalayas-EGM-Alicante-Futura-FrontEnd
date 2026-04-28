import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Atalayas — Gestión empresarial',
    template: '%s | Atalayas',
  },
  description:
    'Plataforma integral de gestión empresarial: empleados, formación, documentos y comunicación en un solo panel.',
  keywords: ['gestión empresarial', 'formación', 'onboarding', 'empleados', 'cursos'],
  authors: [{ name: 'Atalayas' }],
  creator: 'Atalayas',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Atalayas',
    title: 'Atalayas — Gestión empresarial',
    description: 'Plataforma integral de gestión empresarial con IA.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={cn('font-sans', inter.variable)} suppressHydrationWarning>
      <head>
        {/* Inicialización del modo oscuro antes de que React hidrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('darkMode') === 'true') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
