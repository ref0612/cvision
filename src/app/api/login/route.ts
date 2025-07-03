import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    console.log('Intento de inicio de sesión para usuario:', username);
    
    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      console.log('Usuario no encontrado:', username);
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Verificar contraseña (en producción, usar bcrypt)
    const isValid = user.password === password && user.isActive;
    console.log('Credenciales válidas?:', isValid);
    
    if (!isValid) {
      console.log('Credenciales inválidas para usuario:', username);
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    console.log('Inicio de sesión exitoso para usuario:', username);
    
    // Crear la respuesta exitosa
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Inicio de sesión exitoso',
        user: { 
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );
    
    // Configurar la cookie de sesión
    response.cookies.set({
      name: 'session',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });
    
    console.log('Cookie de sesión configurada correctamente');
    
    return response;
    
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
