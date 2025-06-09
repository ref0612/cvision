'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider'; // Importar useAuth

interface SiteHeaderProps {
  onMenuClick?: () => void;
}

export function SiteHeader({ onMenuClick }: SiteHeaderProps) {
  const { logout } = useAuth(); // Obtener logout del AuthProvider

  // Ya no necesitamos handleLogout local, usamos el del AuthProvider
  // const handleLogout = () => {
  //   // Eliminar cookie de sesión
  //   document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  //   // Redirigir a la página de login
  //   window.location.href = '/login';
  // };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">ContableVision</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={logout} // Usar la función logout del AuthProvider
            className="bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
