'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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

  // Efecto para verificar autenticación al montar
  useEffect(() => {
    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);
    
    // Si no está autenticado y no está en la página de login, redirigir
    if (!authStatus && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
      return;
    }
    
    setIsInitialized(true);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('AuthProvider - Iniciando login con usuario:', username);
    
    try {
      // Simulamos una petición de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        console.log('AuthProvider - Credenciales válidas');
        
        // Obtener el dominio actual
        const domain = window.location.hostname === 'localhost' ? 'localhost' : '.vercel.app';
        
        // Establecer cookie de sesión con dominio explícito
        const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        const cookieString = `session=true; path=/; max-age=86400; domain=${domain}; SameSite=Lax${secureFlag}`;
        document.cookie = cookieString;
        
        console.log('AuthProvider - Cookie establecida:', cookieString);
        
        // Actualizar el estado
        setIsAuthenticated(true);
        
        // Redirigir al dashboard con un pequeño retraso para asegurar que la cookie se establezca
        setTimeout(() => {
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
          window.location.href = callbackUrl;
        }, 100);
        
        return true;
      } else {
        console.log('AuthProvider - Credenciales inválidas');
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    // Obtener el dominio actual
    const domain = window.location.hostname === 'localhost' ? 'localhost' : '.vercel.app';
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    
    // Eliminar la cookie de sesión con el dominio correcto
    document.cookie = `session=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
    
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
