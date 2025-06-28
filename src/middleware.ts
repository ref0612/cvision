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
  '/404'
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
  const sessionCookie = request.cookies.get('session');
  const isPublicPath = publicPaths.some(path => {
    // Verificar si la ruta actual comienza con alguna ruta pública
    return pathname === path || pathname.startsWith(`${path}/`);
  });

  // Configuración del dominio
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? '.cvision-six.vercel.app' : 'localhost';
  
  // Verificar la cookie de sesión
  const isAuthenticated = sessionCookie?.value === 'true';

  // Log de depuración
  console.log('\n--- Middleware ---');
  console.log('Ruta solicitada:', pathname);
  console.log('Método:', request.method);
  console.log('Es ruta pública:', isPublicPath);
  console.log('Cookie de sesión:', sessionCookie ? 'Presente' : 'Ausente');
  console.log('Usuario autenticado:', isAuthenticated);

  // 1. Permitir todas las solicitudes a rutas públicas
  if (isPublicPath) {
    // Si el usuario ya está autenticado y está intentando acceder a /login, redirigir al dashboard
    if (pathname === '/login' && isAuthenticated) {
      console.log('Redirigiendo a /dashboard (ya autenticado)');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Permitir el acceso a rutas públicas sin autenticación
    console.log('Acceso permitido a ruta pública:', pathname);
    return NextResponse.next();
  }

  // 2. Permitir todas las solicitudes a la API
  if (pathname.startsWith('/api/')) {
    console.log('Permitiendo acceso a API:', pathname);
    const response = NextResponse.next();
    
    // Configurar CORS para respuestas de API
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', isProduction ? 'https://cvision-six.vercel.app' : 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // 3. Si no es una ruta pública y el usuario no está autenticado, redirigir a login
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

  // 4. Si llegamos aquí, el usuario está autenticado y puede acceder a la ruta
  console.log('Acceso permitido a ruta protegida:', pathname);
  
  // Configurar la respuesta para la ruta solicitada
  const response = NextResponse.next();
  
  // Configurar cabeceras para evitar caché
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}
