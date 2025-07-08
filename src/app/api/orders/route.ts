import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Listar pedidos y cotizaciones
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { orderDate: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

// POST: Crear cotización/pedido y bloquear stock
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/orders - Iniciando...');
    console.log('Prisma object:', typeof prisma);
    console.log('Prisma order model:', typeof prisma.order);
    
    const data = await req.json();
    console.log('Data recibida:', data);
    
    const { customerName, rut, telefono, items, totalAmount, totalNetAmount, totalIvaAmount, status } = data;

    // Validar datos requeridos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requieren items para crear la cotización' }, { status: 400 });
    }

    // Validar stock y bloquear
    for (const item of items) {
      if (item.productId) {
        const inv = await prisma.inventoryItem.findUnique({ where: { id: item.productId } });
        if (!inv || inv.quantity < item.quantity) {
          return NextResponse.json({ error: `Stock insuficiente para ${item.productName}` }, { status: 400 });
        }
      }
    }

    console.log('Creando pedido/cotización...');
    
    // Crear pedido/cotización
    const order = await prisma.order.create({
      data: {
        customerName,
        rut,
        telefono,
        status: status || 'COTIZACION_ENVIADA',
        totalAmount,
        totalNetAmount,
        totalIvaAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPriceWithVat: item.unitPriceWithVat,
            netUnitPrice: item.netUnitPrice,
          })),
        },
      },
      include: { items: true },
    });

    console.log('Pedido creado:', order);

    // Bloquear stock
    for (const item of items) {
      if (item.productId) {
        await prisma.inventoryItem.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    console.log('Stock bloqueado exitosamente');
    return NextResponse.json(order);
    
  } catch (error) {
    console.error('Error en POST /api/orders:', error);
    return NextResponse.json({ 
      error: 'Error al crear la cotización',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 