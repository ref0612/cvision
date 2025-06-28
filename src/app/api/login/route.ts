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
    
    // Establecer la cookie manualmente
    const cookieValue = `session=true; Path=/; Max-Age=86400; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; HttpOnly`;
    response.headers.set('Set-Cookie', cookieValue);
    
    console.log('Cookie establecida:', cookieValue);
    
    return response;
    
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
