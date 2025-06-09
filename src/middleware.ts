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

  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = sessionCookie?.value === 'true';

  // Si el usuario está autenticado y trata de acceder a /login, redirigir a /dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si el usuario NO está autenticado y NO está en /login, redirigir a /login
  // con callbackUrl si la ruta original no era la raíz.
  if (!isAuthenticated && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    let targetCallbackUrl = '';
    if (pathname === '/') {
      targetCallbackUrl = '/dashboard';
    } else {
      targetCallbackUrl = pathname; // Intentionally omitting request.nextUrl.search for now
    }
    loginUrl.searchParams.set('callbackUrl', targetCallbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado y no está en /login, o
  // si el usuario NO está autenticado PERO YA ESTÁ EN /login, permitir continuar.

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
