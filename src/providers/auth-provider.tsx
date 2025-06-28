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
    const cookies = document.cookie.split(';').map(c => c.trim());
    const hasSession = cookies.some(cookie => cookie.startsWith('session=') && cookie.includes('true'));
    
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
    try {
      // Simulamos una petición de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Establecer cookie de sesión
        const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        document.cookie = `session=true; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
        
        // Actualizar el estado
        setIsAuthenticated(true);
        
        // Redirigir al dashboard
        const urlParams = new URLSearchParams(window.location.search);
        let callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
        
        try {
          // Asegurarse de que la URL de retorno sea válida
          callbackUrl = decodeURIComponent(callbackUrl);
          if (!callbackUrl.startsWith('/')) {
            callbackUrl = '/dashboard';
          }
        } catch (e) {
          console.error('Error decoding callbackUrl:', e);
          callbackUrl = '/dashboard';
        }
        
        window.location.href = callbackUrl;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    // Eliminar la cookie de sesión
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
    
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
