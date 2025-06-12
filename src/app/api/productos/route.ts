import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newItem = await prisma.inventoryItem.create({
      data: {
        name: data.name || data.nombre, // Soporta ambos nombres por compatibilidad
        description: data.description || data.descripcion,
        purchasePrice: data.purchasePrice || parseFloat(data.precio) * 100, // Asumiendo que el precio viene en unidades
        quantity: data.quantity || parseInt(data.stock, 10) || 0,
        sku: data.sku || null,
        supplier: data.supplier || null,
        size: data.size || null
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}
