# ContableVision

Sistema de gestión integral de inventario, finanzas y costos.

## Estado del Proyecto

✅ **Base de datos conectada**: Neon.tech PostgreSQL  
✅ **Autenticación funcionando**: Sistema de login con cookies  
✅ **Middleware configurado**: Protección de rutas  
✅ **Modelos de datos**: Usuarios, inventario, productos vendibles  

## Credenciales de Desarrollo

- **Usuario**: `admin`
- **Contraseña**: `admin123`

## Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI
- **Base de datos**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Autenticación**: Cookies HTTP-only

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # Endpoints de API
│   ├── dashboard/         # Páginas del dashboard
│   └── login/             # Página de login
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
├── providers/             # Context providers
└── middleware.ts          # Middleware de autenticación
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Crear usuario administrador
npx ts-node prisma/create-admin-user.ts

# Abrir Prisma Studio
npx prisma studio
```

## Problemas Solucionados

1. **Loop infinito en login**: Eliminadas verificaciones redundantes de autenticación
2. **Middleware conflictivo**: Configurado correctamente para proteger rutas específicas
3. **Cookies de sesión**: Simplificada la configuración para evitar problemas de dominio
4. **Base de datos**: Agregado modelo de usuario y migración correspondiente

## Próximos Pasos

- [ ] Implementar hash de contraseñas con bcrypt
- [ ] Agregar validación de formularios con Zod
- [ ] Implementar roles y permisos
- [ ] Agregar tests unitarios
- [ ] Configurar CI/CD
