import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    console.log('Intento de inicio de sesión para usuario:', username);
    
    // Validar credenciales (esto es un ejemplo, deberías validar contra tu base de datos)
    const isValid = username === 'admin' && password === 'admin';
    
    if (!isValid) {
      console.log('Credenciales inválidas para usuario:', username);
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': 'https://cvision-six.vercel.app',
          }
        }
      );
    }
    
    console.log('Inicio de sesión exitoso para usuario:', username);
    
    // Configurar la cookie de sesión
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Inicio de sesión exitoso',
        user: { username }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': 'https://cvision-six.vercel.app',
        }
      }
    );
    
    // Configurar la cookie de sesión segura
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? '.cvision-six.vercel.app' : 'localhost';
    
    console.log('Configurando cookie de sesión para dominio:', domain);
    
    response.cookies.set({
      name: 'session',
      value: 'true',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      domain: domain
    });
    
    console.log('Cookie de sesión configurada correctamente');
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
