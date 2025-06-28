import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/login', 
  '/_next', 
  '/favicon.ico', 
  '/api', 
  '/_vercel', 
  '/assets', 
  '/unauthorized',
  '/_error'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('\n--- Middleware ---');
  console.log('Ruta solicitada:', pathname);
  console.log('Método:', request.method);

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Si es una ruta pública, permitir el acceso
  if (isPublicPath) {
    console.log('Ruta pública, acceso permitido');
    return NextResponse.next();
  }

  // Verificar la cookie de sesión
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = sessionCookie?.value === 'true';
  
  console.log('Cookie de sesión:', sessionCookie?.value || 'No encontrada');
  console.log('Autenticado:', isAuthenticated);

  // Si es la ruta de api/login, permitir el acceso
  if (pathname === '/api/login') {
    console.log('Acceso a API de login permitido');
    return NextResponse.next();
  }

  // Si es la ruta de login
  if (pathname === '/login') {
    if (isAuthenticated) {
      console.log('Usuario ya autenticado, redirigiendo a /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.log('Acceso a login permitido');
    return NextResponse.next();
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a /login');
    const loginUrl = new URL('/login', request.url);
    // Solo mantener la ruta actual si no es la raíz
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
      console.log('Redirigiendo a login con callbackUrl:', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Si llegamos aquí, el usuario está autenticado y puede acceder a la ruta
  console.log('Acceso permitido a ruta protegida:', pathname);
  
  // Crear respuesta
  const response = NextResponse.next();
  
  // No es necesario refrescar la cookie aquí ya que se maneja en la API de login
  // Esto evita conflictos con las cabeceras de respuesta
  
  return response;
}

export const config = {
  // Excluir archivos estáticos y rutas de API
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json)$).*)',
  ],
};
