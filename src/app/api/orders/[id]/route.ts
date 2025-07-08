import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT: Actualizar orden/cotización
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await req.json();
    
    const { customerName, rut, telefono, description } = data;

    // Validar que la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Actualizar la orden
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        rut,
        telefono,
        description,
      },
      include: { items: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 });
  }
}

// DELETE: Eliminar orden/cotización
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    // Validar que la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Si es una cotización enviada, desbloquear el stock
    if (existingOrder.status === 'COTIZACION_ENVIADA') {
      for (const item of existingOrder.items) {
        if (item.productId) {
          await prisma.inventoryItem.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    // Eliminar los items de la orden primero
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Eliminar la orden
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 500 });
  }
} 