// prisma/connection.ts
import { PrismaClient, Prisma } from '@prisma/client'

// Asegurarse de que la URL de la base de datos esté definida
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno')
}

// Configuración de logging basada en el entorno
const logLevel: Prisma.LogLevel[] = process.env.NODE_ENV === 'production' 
  ? ['error', 'warn'] 
  : ['query', 'info', 'warn', 'error']

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: logLevel,
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// En producción, siempre crea una nueva instancia
// En desarrollo, reutiliza la instancia si existe
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma