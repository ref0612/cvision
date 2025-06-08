import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    // El orden es importante por las restricciones de clave foránea
    await prisma.detalleVenta.deleteMany({});
    await prisma.venta.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.cliente.deleteMany({});
    
    console.log('✅ Base de datos limpiada exitosamente');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
