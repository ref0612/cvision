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
      { status: 200 }
    );
    
    // Establecer cookie de sesión
    response.cookies.set({
      name: 'session',
      value: 'true',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 día
    });
    
    return response;
    
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
