'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales harcodeadas (solo para desarrollo)
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Verifica la cookie en cada render inicial y cuando cambie la ruta
  useEffect(() => {
    setIsLoading(true);
    
    const checkAuth = async () => {
      try {
        console.log('DEBUG AuthProvider: Verificando autenticación...');
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        console.log('DEBUG AuthProvider: Respuesta del servidor =', data);
        
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setIsLoading(false);
    if (response.ok && data.success) {
      window.location.reload(); // Recarga la app para sincronizar frontend y middleware
      return true;
    }
    throw new Error(data.error || 'Error desconocido al iniciar sesión');
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Llamar al endpoint de logout del servidor
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Actualizar el estado local
        setIsAuthenticated(false);
        
        // Redirigir al login
        window.location.href = '/login';
      } else {
        console.error('Error al cerrar sesión en el servidor');
        // Fallback: eliminar cookie del cliente y recargar
        document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        setIsAuthenticated(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Fallback: eliminar cookie del cliente y recargar
      document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      setIsAuthenticated(false);
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
