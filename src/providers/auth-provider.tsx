'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales harcodeadas (solo para desarrollo)
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Función para verificar autenticación
  const checkAuth = useCallback((): boolean => {
    if (typeof document === 'undefined') return false;
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    const authStatus = !!(sessionCookie && sessionCookie.includes('true'));
    setIsAuthenticated(authStatus);
    return authStatus;
  }, []);

  // Efecto para verificar autenticación al montar y en cambios de ruta
  useEffect(() => {
    const authStatus = checkAuth();
    
    // Si no está autenticado y no está en la página de login, redirigir
    if (!authStatus && !pathname.startsWith('/login')) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      window.location.href = loginUrl.toString();
      return;
    }
    
    // Si está autenticado y está en la página de login, redirigir al dashboard
    if (authStatus && pathname.startsWith('/login')) {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/dashboard';
      window.location.href = callbackUrl;
      return;
    }
    
    setIsInitialized(true);
  }, [pathname, checkAuth]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulamos una petición de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Establecer cookie de sesión
        const cookieOptions = [
          'session=true',
          'path=/',
          'max-age=86400', // 1 día
          'SameSite=Lax',
          process.env.NODE_ENV === 'production' ? 'Secure' : ''
        ].filter(Boolean).join('; ');
        
        // Establecer la cookie
        document.cookie = cookieOptions;
        
        // Actualizar el estado después de establecer la cookie
        setIsAuthenticated(true);
        
        console.log('Cookie establecida:', document.cookie);
        
        // Forzar una recarga completa para asegurar que el estado de autenticación se actualice
        // Usar una URL absoluta para asegurar que funcione correctamente
        const currentSearchParams = new URLSearchParams(window.location.search);
        let redirectTo = currentSearchParams.get('callbackUrl') || '/dashboard';
        
        try {
          redirectTo = decodeURIComponent(redirectTo);
          if (!redirectTo.startsWith('/')) {
            redirectTo = '/dashboard';
          }
        } catch (e) {
          console.error('Error decoding callbackUrl:', e);
          redirectTo = '/dashboard';
        }
        
        // Recargar la página para asegurar que el middleware se ejecute
        window.location.href = redirectTo;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    // Actualizar el estado primero
    setIsAuthenticated(false);
    
    // Luego eliminar la cookie de sesión
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirigir al login
    router.push('/login');
    router.refresh(); // Forzar recarga para asegurar que se apliquen los cambios
  };

  // No renderizar los hijos hasta que la autenticación se haya verificado
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
