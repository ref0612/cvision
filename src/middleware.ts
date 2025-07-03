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
];

// Rutas que requieren autenticación
const protectedPaths = [
  '/dashboard',
  '/inventory',
  '/orders',
  '/income',
  '/expenses',
  '/cost-analysis',
  '/ai-suggestions',
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
  
  // 2. Verificar si la ruta requiere autenticación
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (!isProtectedPath) {
    // Si no es una ruta protegida, permitir acceso
    return NextResponse.next();
  }
  
  // 3. Para rutas protegidas, verificar la cookie de sesión
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = sessionCookie && sessionCookie.value === 'true';
  
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a login desde:', pathname);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 4. Si está autenticado, permitir acceso a la ruta protegida
  console.log('Usuario autenticado, permitiendo acceso a:', pathname);
  return NextResponse.next();
}
