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
  
  // Log de todas las cookies para depuración
  const allCookies = request.cookies.getAll();
  console.log('Todas las cookies:', allCookies);
  console.log('Cookie de sesión:', sessionCookie?.value || 'No encontrada');
  console.log('Autenticado:', isAuthenticated);
  
  // Si es una solicitud a la API de login, permitir el acceso
  if (pathname === '/api/login') {
    console.log('Permitiendo acceso a /api/login');
    return NextResponse.next();
  }

  // Si es una ruta de API, permitir el acceso
  if (pathname.startsWith('/api/')) {
    console.log(`Permitiendo acceso a ruta de API: ${pathname}`);
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
    
    // No redirigir si ya está en la página de login
    if (pathname === '/login') {
      return NextResponse.next();
    }
    
    const loginUrl = new URL('/login', request.url);
    // Solo mantener la ruta actual si no es la raíz
    if (pathname !== '/') {
      const encodedCallbackUrl = encodeURIComponent(pathname);
      loginUrl.searchParams.set('callbackUrl', encodedCallbackUrl);
      console.log('Redirigiendo a login con callbackUrl:', pathname);
    }
    
    // Crear respuesta de redirección
    const response = NextResponse.redirect(loginUrl);
    
    // Asegurarse de que las cabeceras de caché no interfieran
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
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
