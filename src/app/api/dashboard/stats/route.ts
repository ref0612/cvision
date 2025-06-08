import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InventoryStats {
  totalItems: number;
  totalInventoryValue: number;
}

export async function GET() {
  try {
    // Obtener el conteo total de ítems de inventario usando SQL directo
    const countResult = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count FROM "inventory_items"
    `;
    
    const totalItems = countResult[0]?.count || 0;
    
    // Usar SQL raw para calcular correctamente el valor total del inventario
    const valueResult = await prisma.$queryRaw<Array<{ totalValue: number }>>`
      SELECT COALESCE(SUM("purchasePrice" * "quantity"), 0) as "totalValue" 
      FROM "inventory_items"
    `;
    
    const totalInventoryValue = valueResult[0]?.totalValue || 0;

    return NextResponse.json<InventoryStats>({
      totalItems: Number(totalItems),
      totalInventoryValue: Number(totalInventoryValue),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener las estadísticas del dashboard' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
