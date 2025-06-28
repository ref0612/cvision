// Usar la conexión personalizada que maneja mejor las conexiones
import prisma from './connection';

// Función para limpiar datos existentes
async function cleanDatabase() {
  console.log('🧹 Limpiando datos existentes...');
  await prisma.$transaction([
    prisma.productComponent.deleteMany({}),
    prisma.inventoryItem.deleteMany({}),
    prisma.sellableProduct.deleteMany({}),
  ]);
  console.log('✅ Base de datos limpiada exitosamente');
}

async function main() {
  try {
    // Limpiar la base de datos primero
    await cleanDatabase();
    
    console.log('🌱 Comenzando la siembra de datos...');

    // Crear un ítem de inventario de ejemplo
    const item = await prisma.inventoryItem.create({
      data: {
        name: 'Producto de ejemplo',
        quantity: 50,
        purchasePrice: 1000,
        description: 'Un producto de ejemplo para la base de datos',
        sku: 'EXAMPLE-001',
        supplier: 'Proveedor Ejemplo S.A.',
        size: 'M',
      },
    });

    // Crear un producto vendible de ejemplo
    const product = await prisma.sellableProduct.create({
      data: {
        name: 'Paquete Premium',
        description: 'Paquete con productos premium',
        desiredProfitMargin: 0.35,
        totalComponentCost: 7500,
        netSalePriceWithoutIVA: 10125,
        ivaAmountOnSale: 1923.75,
        finalSalePriceWithIVA: 12048.75,
      },
    });

    // Crear la relación entre ellos
    await prisma.productComponent.create({
      data: {
        quantity: 1,
        itemName: item.name,
        purchasePriceAtTimeOfAssembly: item.purchasePrice,
        inventoryItem: { connect: { id: item.id } },
        sellableProduct: { connect: { id: product.id } },
      },
    });

    console.log('✅ Datos de ejemplo creados exitosamente');
  } catch (error) {
    console.error('❌ Error durante la siembra de datos:', error);
    throw error;
  }
}

// Ejecutar la función principal
main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
      console.log('🔌 Conexión a la base de datos cerrada');
    } catch (e) {
      console.error('Error al cerrar la conexión:', e);
      process.exit(1);
    }
  });
