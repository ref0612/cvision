import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si el usuario admin ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('✅ El usuario admin ya existe');
      return;
    }

    // Crear el usuario administrador
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'admin123', // En producción, esto debería estar hasheado
        email: 'admin@cvision.com',
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:', adminUser.username);
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 