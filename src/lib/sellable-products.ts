import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductComponent {
  id?: string;
  itemName: string;
  quantity: number;
  purchasePriceAtTimeOfAssembly: number;
  inventoryItemId?: string | null;
}

export interface SellableProduct {
  id: string;
  name: string;
  description?: string | null;
  components: ProductComponent[];
  desiredProfitMargin: number;
  totalComponentCost: number;
  netSalePriceWithoutIVA: number;
  ivaAmountOnSale: number;
  finalSalePriceWithIVA: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getSellableProducts(): Promise<SellableProduct[]> {
  try {
    const products = await prisma.sellableProduct.findMany({
      include: {
        components: true,
      },
      orderBy: { name: 'asc' },
    });
    
    return products as unknown as SellableProduct[];
  } catch (error) {
    console.error('Error fetching sellable products:', error);
    throw error;
  }
}

export async function createSellableProduct(productData: Omit<SellableProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<SellableProduct> {
  try {
    const product = await prisma.sellableProduct.create({
      data: {
        name: productData.name,
        description: productData.description || null,
        desiredProfitMargin: productData.desiredProfitMargin,
        totalComponentCost: productData.totalComponentCost,
        netSalePriceWithoutIVA: productData.netSalePriceWithoutIVA,
        ivaAmountOnSale: productData.ivaAmountOnSale,
        finalSalePriceWithIVA: productData.finalSalePriceWithIVA,
        components: {
          create: productData.components.map(comp => ({
            itemName: comp.itemName,
            quantity: comp.quantity,
            purchasePriceAtTimeOfAssembly: comp.purchasePriceAtTimeOfAssembly,
            inventoryItemId: comp.inventoryItemId || null,
          })),
        },
      },
      include: {
        components: true,
      },
    });
    
    return product as unknown as SellableProduct;
  } catch (error) {
    console.error('Error creating sellable product:', error);
    throw error;
  }
}

export async function updateSellableProduct(id: string, productData: Partial<SellableProduct>): Promise<SellableProduct> {
  try {
    // Primero actualizamos el producto
    const updatedProduct = await prisma.sellableProduct.update({
      where: { id },
      data: {
        name: productData.name,
        description: productData.description || null,
        desiredProfitMargin: productData.desiredProfitMargin,
        totalComponentCost: productData.totalComponentCost,
        netSalePriceWithoutIVA: productData.netSalePriceWithoutIVA,
        ivaAmountOnSale: productData.ivaAmountOnSale,
        finalSalePriceWithIVA: productData.finalSalePriceWithIVA,
      },
      include: {
        components: true,
      },
    });

    // Luego actualizamos los componentes
    if (productData.components) {
      // Eliminar componentes existentes
      await prisma.productComponent.deleteMany({
        where: { sellableProductId: id },
      });

      // Crear nuevos componentes
      await prisma.productComponent.createMany({
        data: productData.components.map(comp => ({
          sellableProductId: id,
          itemName: comp.itemName,
          quantity: comp.quantity,
          purchasePriceAtTimeOfAssembly: comp.purchasePriceAtTimeOfAssembly,
          inventoryItemId: comp.inventoryItemId || null,
        })),
      });

      // Obtener el producto con los componentes actualizados
      const productWithComponents = await prisma.sellableProduct.findUnique({
        where: { id },
        include: { components: true },
      });

      return productWithComponents as unknown as SellableProduct;
    }

    return updatedProduct as unknown as SellableProduct;
  } catch (error) {
    console.error('Error updating sellable product:', error);
    throw error;
  }
}

export async function deleteSellableProduct(id: string): Promise<void> {
  try {
    // Primero eliminamos los componentes asociados
    await prisma.productComponent.deleteMany({
      where: { sellableProductId: id },
    });
    
    // Luego eliminamos el producto
    await prisma.sellableProduct.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting sellable product:', error);
    throw error;
  }
}
