import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    
    // Verificar si las tablas existen
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // Verificar si hay usuarios en la base de datos
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tables: tables.map(t => t.table_name),
      userCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en health check:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error al desconectar Prisma:', disconnectError);
    }
  }
} 