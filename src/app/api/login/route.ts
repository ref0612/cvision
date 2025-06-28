import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Validar credenciales (esto es solo un ejemplo)
    const isValid = username === 'admin' && password === 'admin123';
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Crear respuesta exitosa
    const response = NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Pragma': 'no-cache'
        }
      }
    );
    
    // Configuración de la cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? '.cvision-six.vercel.app' : 'localhost';
    
    // Establecer la cookie manualmente
    response.cookies.set({
      name: 'session',
      value: 'true',
      path: '/',
      domain: domain,
      maxAge: 60 * 60 * 24, // 1 día
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    });
    
    console.log('Cookie configurada para el dominio:', domain);
    
    return response;
    
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
