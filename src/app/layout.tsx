import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Pacifico } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] });
const pacifico = Pacifico({ weight: '400', subsets: ['latin'], variable: '--font-creative' });

export const metadata: Metadata = {
  title: 'ContableVision',
  description: 'Gestión integral de inventario, finanzas y costos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${pacifico.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <div className="flex-1 flex flex-col w-full min-h-screen">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}