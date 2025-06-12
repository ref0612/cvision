import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  description: string | null;
  sku: string | null;
  supplier: string | null;
  lastRestocked: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const data = await request.json();

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...data,
        quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
        purchasePrice: data.purchasePrice !== undefined ? Number(data.purchasePrice) : undefined,
        lastRestocked: data.lastRestocked ? new Date(data.lastRestocked) : null,
      },
    });

    return NextResponse.json({
      ...updatedItem,
      id: String(updatedItem.id),
    } as InventoryItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el ítem' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el ítem' },
      { status: 500 }
    );
  }
}