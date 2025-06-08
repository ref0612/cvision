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
  size: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Error al obtener el inventario' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newItem = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        quantity: Number(data.quantity) || 0,
        purchasePrice: Number(data.purchasePrice) || 0,
        description: data.description?.trim() || null,
        sku: data.sku?.trim() || null,
        supplier: data.supplier?.trim() || null,
        size: data.size?.trim() || null,
      }
    });
    
    return NextResponse.json({
      ...newItem,
      id: String(newItem.id)
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Error al crear el artículo del inventario' },
      { status: 500 }
    );
  }
}
