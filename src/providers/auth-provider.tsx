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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Verificar si hay una sesión activa
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    const isAuth = sessionCookie && sessionCookie.includes('true');
    setIsAuthenticated(!!isAuth);
    return isAuth;
  };

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
          'SameSite=Lax', // Cambiado de Strict a Lax para permitir redirecciones
          'Secure',
          'HttpOnly'
        ];
        
        document.cookie = cookieOptions.join('; ');
        setIsAuthenticated(true);
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
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsAuthenticated(false);
    router.push('/login');
  };

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
