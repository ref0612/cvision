import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/login',
  '/_next',
  '/favicon.ico',
  '/api',
  '/_vercel',
  '/assets',
  '/unauthorized',
  '/_error',
  '/500',
  '/404',
  '/dashboard' // Temporalmente hacer pública esta ruta para pruebas
];

// Configuración del middleware
export const config = {
  // Solo ejecutar el middleware en rutas específicas, excluyendo archivos estáticos
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Permitir todas las solicitudes a rutas públicas
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isPublicPath) {
    console.log('Acceso permitido a ruta pública:', pathname);
    return NextResponse.next();
  }
  
  // 2. Para todas las demás rutas, redirigir a login temporalmente
  console.log('Redirigiendo a login desde:', pathname);
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}
