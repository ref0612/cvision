-- Crear usuario de Prisma
CREATE USER "prisma" WITH PASSWORD 'nTFsa5Ucy1g0aIYr' BYPASSRLS CREATEDB;

-- Extender privilegios a postgres (necesario para ver cambios en el Dashboard)
GRANT "prisma" TO "postgres";

-- Otorgar permisos necesarios sobre el esquema público
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
