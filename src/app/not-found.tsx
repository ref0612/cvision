import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Página no encontrada</h1>
          <p className="text-gray-500 dark:text-gray-400">
            La página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button asChild>
            <Link href="/dashboard">
              Volver al Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Ir al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
