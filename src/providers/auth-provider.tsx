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

  // Deriva isAuthenticated de la cookie de sesión en cada render
  function getSessionAuth(): boolean {
    if (typeof document === 'undefined') return false;
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    return !!(sessionCookie && sessionCookie.includes('true'));
  }
  const isAuthenticated = getSessionAuth();
  // Log visual y de consola para depuración
  if (typeof window !== 'undefined') {
    console.log('Cookie actual:', document.cookie);
    console.log('isAuthenticated:', isAuthenticated);
  }

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
          process.env.NODE_ENV === 'production' ? 'Secure' : '',
          'HttpOnly'
        ].filter(Boolean).join('; ');
        
        document.cookie = cookieOptions;
        
        // Obtener la URL de redirección de los parámetros de búsqueda
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
        
        // Forzar una recarga completa para asegurar que el estado de autenticación se actualice
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
    // Eliminar la cookie de sesión
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    window.location.href = '/login'; // Hard redirect
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
