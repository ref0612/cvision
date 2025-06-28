import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/connection';

interface InventoryStats {
  totalItems: number;
  totalInventoryValue: number;
}

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    
    // Verificar si la tabla existe
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
      ) as "exists"
    `;
    
    if (!tableExists[0]?.exists) {
      return NextResponse.json(
        { 
          totalItems: 0,
          totalInventoryValue: 0,
          message: 'La tabla de inventario está vacía o no existe'
        },
        { status: 200 }
      );
    }

    // Obtener el conteo total de ítems de inventario usando SQL directo
    let totalItems = 0;
    let totalInventoryValue = 0;

    try {
      const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "inventory_items"
      `;
      totalItems = Number(countResult[0]?.count || 0);
      
      // Usar SQL raw para calcular correctamente el valor total del inventario
      const valueResult = await prisma.$queryRaw<Array<{ totalValue: number }>>`
        SELECT COALESCE(SUM("purchasePrice" * "quantity"), 0) as "totalValue" 
        FROM "inventory_items"
      `;
      
      totalInventoryValue = Number(valueResult[0]?.totalValue || 0);
    } catch (queryError) {
      console.error('Error en consulta SQL:', queryError);
      // Si hay un error en la consulta, devolver valores por defecto
      return NextResponse.json(
        { 
          totalItems: 0,
          totalInventoryValue: 0,
          message: 'Error al consultar la base de datos'
        },
        { status: 200 }
      );
    }

    return NextResponse.json<InventoryStats>({
      totalItems,
      totalInventoryValue,
    });
  } catch (error) {
    console.error('Error en el endpoint de estadísticas:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al obtener estadísticas';
    return NextResponse.json(
      { 
        error: 'Error al obtener las estadísticas del dashboard',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
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
