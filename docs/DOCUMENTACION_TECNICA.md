# Documentación Técnica - ContableVision

## 1. Introducción
ContableVision es una plataforma web para la gestión contable, inventario y declaración tributaria de pymes y emprendedores.

## 2. Arquitectura y Tecnologías
- **Frontend:** Next.js 15, React 18, TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **Backend:** Next.js API routes, Prisma ORM
- **Base de datos:** PostgreSQL (Neon.tech)
- **Autenticación:** Cookies HTTP-only, middleware de sesión
- **Arquitectura:** Monolito modular con App Router

## 3. Modelos de Datos (Prisma)
### Income
```prisma
model Income {
  id         String   @id @default(uuid())
  date       DateTime @default(now())
  source     String
  amount     Float
  netAmount  Float
  ivaAmount  Float
  description String?
}
```
### Expense
```prisma
model Expense {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  category    String
  amount      Float
  hasInvoice  Boolean  @default(false)
  description String?
}
```

## 4. Endpoints/API
- **GET /api/income?from=YYYY-MM-DD&to=YYYY-MM-DD**
- **POST /api/income**
- **GET /api/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD**
- **POST /api/expenses**
- Respuestas en formato JSON. Ejemplo:
```json
[
  {
    "id": "...",
    "date": "2025-07-01T00:00:00.000Z",
    "source": "Cliente X",
    "amount": 119000,
    "netAmount": 100000,
    "ivaAmount": 19000,
    "description": "Venta mensual"
  }
]
```

## 5. Flujos principales
- Registro, edición y eliminación de ingresos/egresos
- Cálculo automático de IVA y utilidad
- Filtros por rango de fechas
- Resumen fiscal mensual (Declaración SII)
- Protección de rutas y autenticación

## 6. Seguridad
- Autenticación por cookies y middleware
- Protección de rutas privadas
- Contraseñas (deben hashearse en producción)

## 7. Comandos útiles
```bash
npm run dev
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/create-admin-user.ts
npx prisma studio
```

## 8. Mantenimiento
- Actualizar dependencias con `npm update`
- Migrar base de datos con `npx prisma migrate dev`
- Solucionar errores consultando logs y documentación oficial

## 9. Contacto y soporte
Para dudas, sugerencias o soporte, abre un issue en el repositorio o contacta al equipo técnico.
