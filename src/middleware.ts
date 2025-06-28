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

  if (isPublicPath) {
    console.log('Middleware - Ruta pública, acceso permitido');
    return NextResponse.next();
  }

  // Verificar la cookie de sesión
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = sessionCookie?.value === 'true';
  
  console.log('Middleware - Cookie de sesión:', sessionCookie);
  console.log('Middleware - Autenticado:', isAuthenticated);

  // Si el usuario NO está autenticado, redirigir a /login con la URL de retorno
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', '/dashboard');
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
  // Aplicar a todas las rutas excepto las estáticas y las de API
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|_vercel|assets).*)',
  ],
};
