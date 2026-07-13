# Database Design

## ORM

Prisma ORM

## Database

PostgreSQL on Neon.

The backend now uses PostgreSQL for the normal application database. The RAG/vector layer also uses PostgreSQL with `pgvector`, currently through `NEON_VECTOR_URL`.

## Environment Variables

Use a pooled Neon connection string for the application runtime:

```env
DATABASE_URL="postgresql://USER:PASSWORD@EP-ID-pooler.REGION.aws.neon.tech/DB_NAME?sslmode=require"
```

Use a direct Neon connection string for Prisma migrations:

```env
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@EP-ID.REGION.aws.neon.tech/DB_NAME?sslmode=require"
```

Use a Neon/Postgres connection string for vector storage:

```env
NEON_VECTOR_URL="postgresql://USER:PASSWORD@EP-ID.REGION.aws.neon.tech/DB_NAME?sslmode=require"
```

For a small deployment, `DATABASE_URL`, `DIRECT_DATABASE_URL`, and `NEON_VECTOR_URL` can point to the same Neon database, but:

- `DATABASE_URL` should use the pooled hostname for Cloud Run runtime.
- `DIRECT_DATABASE_URL` should use the direct hostname for migrations.
- `NEON_VECTOR_URL` can use the same database or a separate Neon database/project for RAG isolation.

## Prisma Connection

The datasource is defined in `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

## Vector Database

The vector layer uses `src/utils/vectorDb.js` and expects `NEON_VECTOR_URL`.

The vector database must support:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run the vector setup script after configuring `NEON_VECTOR_URL`:

```powershell
node scripts/setup-neon.js
```

## Migration Commands

From `hotelogx_connect_app/backend`:

```powershell
npm install
npx prisma format --schema=prisma\schema.prisma
npx prisma generate --schema=prisma\schema.prisma
npx prisma migrate dev --schema=prisma\schema.prisma --name init_postgres_neon
```

For production deployment:

```powershell
npx prisma migrate deploy --schema=prisma\schema.prisma
```

## Notes

- Do not use a MySQL URL in `DATABASE_URL` anymore.
- Do not use the pooled Neon URL for schema migrations; use `DIRECT_DATABASE_URL`.
- If migrating existing MySQL data, export/import data separately after creating the PostgreSQL schema. This change prepares the schema for a fresh Neon Postgres database.
- Keep Prisma app tables and vector tables in the same Neon database only if operational simplicity is more important than strict isolation.

