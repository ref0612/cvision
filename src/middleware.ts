import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/_next', '/favicon.ico', '/api', '/_vercel', '/assets', '/unauthorized'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware - Ruta solicitada:', pathname);

  // Si es una ruta pública, permitir el acceso
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Si es la ruta de login y ya está autenticado, redirigir al dashboard
  if (pathname.startsWith('/login')) {
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie?.value === 'true') {
      console.log('Middleware - Usuario autenticado en /login, redirigiendo a /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Permitir acceso a rutas públicas
  if (isPublicPath) {
    console.log('Middleware - Ruta pública, acceso permitido');
    return NextResponse.next();
  }

  // Verificar la cookie de sesión
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = sessionCookie?.value === 'true';
  
  console.log('Middleware - Cookie de sesión:', sessionCookie?.value);
  console.log('Middleware - Autenticado:', isAuthenticated);

  // Si el usuario NO está autenticado, redirigir a /login
  if (!isAuthenticated) {
    console.log('Middleware - Usuario no autenticado, redirigiendo a /login');
    const loginUrl = new URL('/login', request.url);
    // Solo mantener la ruta actual si no es la raíz
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Usuario autenticado, permitir acceso
  const response = NextResponse.next();
  
  // Refrescar la cookie para extender la sesión
  response.cookies.set({
    name: 'session',
    value: 'true',
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 día
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
