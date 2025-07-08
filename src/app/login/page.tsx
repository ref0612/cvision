'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BarChart3 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir automáticamente si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isLoading]);

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar el formulario si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent">
                <BarChart3 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">ContableVision</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form 
            className="mt-8 space-y-6 card" 
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              if (!username || !password) {
                setError('Por favor ingresa usuario y contraseña');
                return;
              }
              setIsSubmitting(true);
              setError('');
              try {
                const success = await login(username, password);
                if (!success) {
                  setError('Usuario o contraseña incorrectos');
                }
              } catch (err: any) {
                setError(err.message || 'Ocurrió un error al iniciar sesión');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-foreground">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full"
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </div>
          </form>
          
          {/* Información de credenciales para desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-accent/10 border border-accent/20 text-accent-foreground text-sm rounded-lg">
              <p className="font-semibold">Credenciales para desarrollo:</p>
              <p>Usuario: <span className="font-mono text-primary">admin</span></p>
              <p>Contraseña: <span className="font-mono text-primary">admin123</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
