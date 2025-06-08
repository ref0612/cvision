import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_BASE_URL = '/api/inventory';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  description: string | null;
  sku: string | null;
  supplier: string | null;
  size: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Error al obtener el inventario');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
}

type CreateInventoryItemInput = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> & { sku?: string | null };

// Función para generar un SKU único basado en el nombre
function generateSKU(name: string): string {
  // Tomar las primeras 3 letras del nombre en mayúsculas
  const prefix = name.slice(0, 3).toUpperCase().padEnd(3, 'X');
  // Agregar un timestamp para hacerlo único
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}`;
}

export async function createInventoryItem(itemData: Omit<CreateInventoryItemInput, 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
  // Generar SKU automáticamente si no se proporciona
  const dataWithSKU = {
    ...itemData,
    sku: itemData.sku || generateSKU(itemData.name)
  };
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataWithSKU),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear el ítem');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(item: Partial<InventoryItem> & { id: string }): Promise<InventoryItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar el ítem');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar el ítem');
    }
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

// Cerrar la conexión de Prisma cuando la aplicación se cierre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
