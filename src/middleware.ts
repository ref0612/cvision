import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/_next', '/favicon.ico', '/api', '/_vercel'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir el acceso
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar si hay una sesión activa
  const session = request.cookies.get('session')?.value;
  
  // Si no hay sesión, redirigir al login
  if (!session || session !== 'session=true') {
    const loginUrl = new URL('/login', request.url);
    // Si no es la raíz, guardamos la URL actual para redirigir después del login
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    } else {
      loginUrl.searchParams.set('callbackUrl', '/dashboard');
    }
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado y está en la página de login, redirigir al dashboard
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si hay sesión, permitir el acceso
  return NextResponse.next();
}

// Asegurarse de que el middleware se ejecute en las rutas correctas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|_vercel).*)',
  ],
};
