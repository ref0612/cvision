'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'visitor';
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    // Redirigir a la página de inicio de sesión si el usuario no está autenticado
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Redirigir a la página de no autorizado si el usuario no tiene el rol requerido
    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [session, status, router, requiredRole]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // No mostrar nada si no hay sesión (ya se redirige a /auth/signin)
  if (!session) {
    return null;
  }

  // Verificar el rol si se requiere
  if (requiredRole && session.user.role !== requiredRole) {
    return null; // Ya se redirige a /unauthorized
  }

  return <>{children}</>;
}
