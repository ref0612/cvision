'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-destructive">¡Algo salió mal!</h2>
              <p className="text-gray-500">
                {error.message || 'Ocurrió un error inesperado en la aplicación.'}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => reset()}
                className="w-full"
              >
                Reintentar
              </Button>
              <Button variant="outline" asChild>
                <a href="/" className="w-full">
                  Ir al Inicio
                </a>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
