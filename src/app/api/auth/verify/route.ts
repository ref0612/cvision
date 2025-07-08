import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Leer la cookie de sesión (httpOnly, solo accesible desde el servidor)
    const sessionCookie = request.cookies.get('session');
    
    console.log('DEBUG /api/auth/verify: sessionCookie =', sessionCookie);
    
    if (sessionCookie && sessionCookie.value === 'true') {
      console.log('DEBUG /api/auth/verify: Usuario autenticado');
      return NextResponse.json({ 
        authenticated: true,
        message: 'Usuario autenticado'
      });
    } else {
      console.log('DEBUG /api/auth/verify: Usuario no autenticado');
      return NextResponse.json({ 
        authenticated: false,
        message: 'Usuario no autenticado'
      });
    }
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 