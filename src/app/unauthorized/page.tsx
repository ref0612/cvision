'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Acceso no autorizado</h1>
          <p className="text-gray-500 dark:text-gray-400">
            No tienes permiso para acceder a esta página. Por favor, inicia sesión con una cuenta que tenga los permisos necesarios.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push('/auth/signin')}
            className="w-full"
          >
            Ir a Iniciar Sesión
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
