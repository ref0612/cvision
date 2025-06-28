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
    // En el servidor, asumimos que el middleware ya verificó la autenticación
    if (typeof document === 'undefined') return false;
    
    console.log('--- Verificación de sesión ---');
    
    // Verificar si hay una cookie de sesión
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    
    // La cookie debe existir y tener el valor 'true'
    const hasValidSession = sessionCookie !== undefined && sessionCookie.includes('true');
    
    // Log detallado para depuración
    console.log('URL actual:', window.location.href);
    console.log('Cookies disponibles:', document.cookie || 'No hay cookies');
    console.log('Cookie de sesión encontrada:', sessionCookie || 'No encontrada');
    console.log('Sesión válida:', hasValidSession);
    
    return hasValidSession;
  };

  // Efecto para verificar autenticación al cargar
  useEffect(() => {
    console.log('\n--- AuthProvider ---');
    console.log('Ruta actual:', window.location.pathname);
    
    const verifyAuth = async () => {
      try {
        // Pequeño retraso para asegurar que las cookies estén disponibles
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar autenticación
        const isAuth = checkAuth();
        console.log('Estado de autenticación:', isAuth);
        
        // Actualizar estado
        setIsAuthenticated(isAuth);
        
        // Solo manejar redirecciones si ya está inicializado
        if (isInitialized) {
          // Si no está autenticado y no está en login, redirigir a login
          if (!isAuth && !window.location.pathname.startsWith('/login')) {
            console.log('No autenticado, redirigiendo a /login');
            const loginUrl = new URL('/login', window.location.origin);
            loginUrl.searchParams.set('callbackUrl', window.location.pathname);
            window.location.href = loginUrl.toString();
            return;
          }
          
          // Si está autenticado y está en login, redirigir al dashboard
          if (isAuth && window.location.pathname.startsWith('/login')) {
            const urlParams = new URLSearchParams(window.location.search);
            let callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
            
            // Asegurarse de que la URL de retorno sea válida
            try {
              callbackUrl = decodeURIComponent(callbackUrl);
              if (!callbackUrl.startsWith('/')) {
                callbackUrl = '/dashboard';
              }
            } catch (e) {
              console.error('Error al decodificar callbackUrl:', e);
              callbackUrl = '/dashboard';
            }
            
            console.log('Autenticado, redirigiendo a:', callbackUrl);
            // Usar replace para evitar que el usuario pueda volver atrás a /login
            window.location.replace(callbackUrl);
            return;
          }
        }
        
        // Marcar como inicializado después de la primera verificación
        if (!isInitialized) {
          console.log('AuthProvider inicializado');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // En caso de error, redirigir a login
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    };
    
    verifyAuth();
  }, [isInitialized]);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('\n--- Iniciando proceso de login ---');
    console.log('Usuario:', username);
    
    try {
      setIsLoading(true);
      
      // Configurar la URL de la API
      const apiUrl = '/api/login';
      
      console.log('Realizando petición POST a:', apiUrl);
      
      // Realizar la petición de login
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Importante para incluir cookies
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        redirected: response.redirected,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Si la respuesta es una redirección, dejamos que el navegador la maneje
      if (response.redirected) {
        console.log('Redirección detectada a:', response.url);
        window.location.href = response.url;
        return true;
      }
      
      const data = await response.json().catch(() => ({}));
      
      if (response.ok && data.success) {
        console.log('Login exitoso, recargando página...');
        
        // Forzar una recarga completa para asegurar que las cookies se establezcan
        window.location.reload();
        return true;
      } else {
        const errorMessage = data.error || 'Error desconocido al iniciar sesión';
        console.error('Error en login:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error en proceso de login:', error);
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
