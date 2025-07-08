'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider'; // Importar useAuth

interface SiteHeaderProps {
  onMenuClick?: () => void;
}

export function SiteHeader({ onMenuClick }: SiteHeaderProps) {
  const { logout } = useAuth(); // Obtener logout del AuthProvider

  return (
    <header className="fixed top-0 left-0 w-full z-20 bg-sidebar md:pl-64 min-h-[5.5rem] flex items-center shadow-sm transition-all duration-200">
      <div className="flex flex-1 h-full items-center justify-between px-4 md:px-6">
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
            <span className="font-creative text-[1.5rem]">Tu Guarida Creativa</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => logout()} // Usar la función logout del AuthProvider
            className="bg-sidebar hover:bg-accent hover:text-accent-foreground border-none"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
