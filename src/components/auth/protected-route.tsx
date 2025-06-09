'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      // Solo ejecutar en el cliente
      if (typeof window === 'undefined') return;
      
      const sessionCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('session='));
      
      const isAuthenticated = sessionCookie === 'session=true';
      
      if (!isAuthenticated) {
        // No redirigir si ya estamos en la página de login
        if (pathname !== '/login') {
          const loginUrl = new URL('/login', window.location.origin);
          loginUrl.searchParams.set('callbackUrl', window.location.pathname + window.location.search);
          window.location.href = loginUrl.toString();
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
