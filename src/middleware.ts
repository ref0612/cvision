import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://cvision-six.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login', '/api/login', '/_next', '/favicon.ico', '/api', '/_vercel', '/assets', '/unauthorized', '/_error'];

// Configuración del middleware
export const config = {
  // Excluir archivos estáticos y rutas de API
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  // Configuración del dominio
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? '.cvision-six.vercel.app' : 'localhost';
  
  // Verificar la cookie de sesión
  const isAuthenticated = sessionCookie?.value === 'true';

  // Log de depuración
  console.log('\n--- Middleware ---');
  console.log('Ruta solicitada:', pathname);
  console.log('Método:', request.method);
  console.log('Dominio:', domain);
  console.log('Cookie de sesión:', sessionCookie ? 'Presente' : 'Ausente');
  console.log('Usuario autenticado:', isAuthenticated);
  console.log('Cookies recibidas:', request.cookies.getAll());

  // Manejar solicitudes OPTIONS para CORS
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Permitir solicitudes de la API
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Añadir encabezados CORS para las respuestas de la API
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }

  // Si es una ruta pública, permitir el acceso
  if (isPublicPath) {
    // Si el usuario ya está autenticado y está intentando acceder a /login, redirigir al dashboard
    if (pathname === '/login' && isAuthenticated) {
      console.log('Usuario ya autenticado, redirigiendo a /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    const response = NextResponse.next();
    // Asegurarse de que las respuestas tengan los encabezados CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  
  // Si el usuario no está autenticado, redirigir a login
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a /login');
    
    const loginUrl = new URL('/login', request.url);
    // Solo mantener la ruta actual si no es la raíz
    if (pathname !== '/') {
      const encodedCallbackUrl = encodeURIComponent(pathname);
      loginUrl.searchParams.set('callbackUrl', encodedCallbackUrl);
      console.log('Redirigiendo a login con callbackUrl:', pathname);
    }
    
    // Crear respuesta de redirección
    const response = NextResponse.redirect(loginUrl);
    
    // Configurar cabeceras para evitar caché
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Configurar CORS
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', isProduction ? 'https://cvision-six.vercel.app' : 'http://localhost:3000');
    
    return response;
  }

  // Si llegamos aquí, el usuario está autenticado y puede acceder a la ruta
  console.log('Acceso permitido a ruta protegida:', pathname);
  
  // Crear respuesta
  const response = NextResponse.next();
  
  // Asegurarse de que las respuestas tengan los encabezados CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
