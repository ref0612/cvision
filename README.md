src/
├── app/                    # App Router de Next.js
│   ├── api/               # Endpoints de API
│   ├── dashboard/         # Páginas del dashboard
│   └── login/             # Página de login

# ContableVision

Sistema web para gestión contable, inventario y declaración tributaria para pymes y emprendedores.

## Objetivo
Centralizar el registro de ingresos, egresos, inventario y generar automáticamente el resumen fiscal tipo SII.

## Usuarios
Empresas, contadores, administradores y emprendedores.

## Módulos principales
- **Ingresos:** Registro y cálculo automático de IVA y neto.
- **Egresos:** Registro de gastos, cálculo de IVA crédito.
- **Inventario:** Gestión de productos y stock.
- **Pedidos:** Registro y control de órdenes.
- **Declaración SII:** Resumen tributario mensual con IVA a pagar/saldo a favor.
- **Análisis de Costos, Cotizaciones, Historial, Configuración de Empresa.**

## Estructura de datos
### IncomeRecord
```typescript
{
  id: string;
  date: Date;
  source: string;
  amount: number;
  netAmount: number;
  ivaAmount: number;
  description?: string;
}
```
### ExpenseRecord
```typescript
{
  id: string;
  date: Date;
  category: string;
  amount: number;
  hasInvoice: boolean;
  description?: string;
}
```

## Tecnologías
- **Frontend:** Next.js 15, React 18, TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **Backend:** Next.js API routes, Prisma ORM
- **Base de datos:** PostgreSQL (Neon.tech)
- **Autenticación:** Cookies HTTP-only, middleware de sesión

## Arquitectura
- Monolito modular con App Router de Next.js
- API RESTful para sincronización frontend-backend

## Estructura del Proyecto
```
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   └── login/
├── components/
├── lib/
├── providers/
└── middleware.ts
```

## Flujos principales
- Registro, edición y eliminación de ingresos/egresos
- Cálculo automático de IVA y utilidad
- Filtros por rango de fechas
- Resumen fiscal mensual (Declaración SII)
- Protección de rutas y autenticación

## Comandos útiles
```bash
# Desarrollo
npm run dev
# Generar cliente Prisma	npx prisma generate
# Migraciones		npx prisma migrate dev
# Crear admin		npx ts-node prisma/create-admin-user.ts
# Abrir Prisma Studio	npx prisma studio
```

## Seguridad
- Autenticación por cookies y middleware
- Protección de rutas privadas
- Contraseñas (deben hashearse en producción)

## Próximos pasos
- [ ] Hash de contraseñas
- [ ] Validación avanzada de formularios
- [ ] Roles y permisos
- [ ] Tests unitarios y de integración
- [ ] CI/CD y despliegue automático

## Contacto y soporte
Para dudas, sugerencias o soporte, abre un issue en el repositorio o contacta al equipo técnico.
