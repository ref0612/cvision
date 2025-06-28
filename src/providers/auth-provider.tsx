'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Función para verificar autenticación
  const checkAuth = (): boolean => {
    if (typeof document === 'undefined') return false;
    
    // Verificar si la cookie de sesión existe
    console.log('AuthProvider - Todas las cookies:', document.cookie);
    const cookies = document.cookie.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    const hasSession = !!sessionCookie && sessionCookie.includes('true');
    
    console.log('AuthProvider - Cookie de sesión encontrada:', sessionCookie);
    console.log('AuthProvider - Sesión válida:', hasSession);
    
    return hasSession;
  };

  // Efecto para verificar autenticación al cargar
  useEffect(() => {
    console.log('\n--- AuthProvider ---');
    console.log('Verificando autenticación en ruta:', window.location.pathname);
    
    // Verificar autenticación
    const isAuth = checkAuth();
    console.log('Estado de autenticación:', isAuth);
    
    // Actualizar estado
    setIsAuthenticated(isAuth);
    
    // Solo manejar redirecciones si ya está inicializado
    if (isInitialized) {
      // Si no está autenticado y no está en login, redirigir a login
      if (!isAuth && window.location.pathname !== '/login') {
        console.log('Redirigiendo a /login');
        const loginUrl = new URL('/login', window.location.origin);
        loginUrl.searchParams.set('callbackUrl', window.location.pathname);
        window.location.href = loginUrl.toString();
        return;
      }
      
      // Si está autenticado y está en login, redirigir al dashboard
      if (isAuth && window.location.pathname === '/login') {
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
        console.log('Redirigiendo a:', callbackUrl);
        window.location.href = callbackUrl;
        return;
      }
    }
    
    // Marcar como inicializado después de la primera verificación
    if (!isInitialized) {
      console.log('AuthProvider inicializado');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('AuthProvider - Iniciando login con usuario:', username);
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para incluir cookies
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('AuthProvider - Inicio de sesión exitoso');
        
        // Actualizar el estado
        setIsAuthenticated(true);
        
        // Obtener la URL de redirección
        const urlParams = new URLSearchParams(window.location.search);
        let callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
        
        try {
          // Asegurarse de que la URL de retorno sea válida
          callbackUrl = decodeURIComponent(callbackUrl);
          if (!callbackUrl.startsWith('/') || callbackUrl === '/') {
            callbackUrl = '/dashboard';
          }
        } catch (e) {
          console.error('Error decoding callbackUrl:', e);
          callbackUrl = '/dashboard';
        }
        
        console.log('AuthProvider - Redirigiendo a:', callbackUrl);
        
        // Forzar una recarga completa para asegurar que el estado se actualice
        window.location.href = callbackUrl;
        return true;
      } else {
        const errorMessage = data.error || 'Error desconocido';
        console.log('AuthProvider - Error en el inicio de sesión:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Configuración básica para eliminar la cookie
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    
    // Eliminar la cookie de sesión
    document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
    
    console.log('AuthProvider - Cookie eliminada');
    
    // Actualizar el estado
    setIsAuthenticated(false);
    
    // Redirigir al login
    window.location.href = '/login';
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
