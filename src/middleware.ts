import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/_next', '/favicon.ico', '/api', '/_vercel', '/assets'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir el acceso
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar la cookie de sesión
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = sessionCookie?.value === 'true';

  // Para depuración
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Session cookie:', sessionCookie?.value);
  console.log('Middleware - Is authenticated:', isAuthenticated);

  // Si el usuario está autenticado y trata de acceder a /login, redirigir a /dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si el usuario NO está autenticado, redirigir a /login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Solo agregar callbackUrl si no es la raíz
    const callbackUrl = pathname === '/' ? '/dashboard' : pathname;
    loginUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Usuario autenticado, permitir acceso
  const response = NextResponse.next();
  
  // Asegurarse de que la cookie de sesión tenga las opciones correctas
  if (sessionCookie) {
    response.cookies.set({
      name: 'session',
      value: 'true',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
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
