'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    // Verificar si hay una cookie de sesión
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='));
    
    const isAuthenticated = sessionCookie && sessionCookie.includes('true');
    
    if (!isAuthenticated) {
      // Si no está autenticado, redirigir a login
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('callbackUrl', pathname || '/dashboard');
      window.location.href = loginUrl.toString();
    } else {
      // Si está autenticado, mostrar el contenido
      setIsLoading(false);
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
