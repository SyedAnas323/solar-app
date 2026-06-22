# solar-pro

Full-stack Solar Panel Management App built with Next.js 14 App Router, Prisma, Supabase Postgres, Tailwind CSS, shadcn-style UI, and NextAuth credentials auth.

## Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env
```
Update `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and admin credentials.
Use the Supabase transaction pooler URL for `DATABASE_URL` (`:6543?pgbouncer=true`) and the direct database URL for `DIRECT_URL`.

3. Push schema
```bash
npx prisma db push
```

4. Seed packages
```bash
npx prisma db seed
```

5. Start dev server
```bash
npm run dev
```

## Auth
- Login route: `/login`
- Default admin from `.env.example`:
  - Email: `admin@solarpro.com`
  - Password: `admin123`

## Vercel Setup
Set these environment variables in Vercel:

```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
NEXTAUTH_SECRET=any-long-random-string
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
ADMIN_EMAIL=admin@solarpro.com
ADMIN_PASSWORD=admin123
```

Important:
- `NEXTAUTH_URL` must be the exact live domain, for example `https://solar-app-black-one.vercel.app`
- Use the Supabase pooler URL for `DATABASE_URL`
- Use the direct Supabase URL for `DIRECT_URL`

## Supabase Setup
Run this SQL in Supabase SQL editor if the admin credential table is missing:

```sql
create table if not exists "AdminCredential" (
  id text primary key,
  email text not null unique,
  "passwordHash" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

insert into "AdminCredential" (id, email, "passwordHash")
values (
  'bootstrap-admin',
  'admin@solarpro.com',
  '$2a$10$fb.C19j7kQfQ4w4dH73/C.ljuf4Ko2ua1hZ4FfJZNS3HY0WFkpW9e'
)
on conflict (email) do nothing;
```

That password hash matches `admin123`.

## Login Flow
1. Open `/login`
2. Sign in with the admin email and password
3. After login, open `/settings`
4. Update admin email/password there if needed
5. The dashboard, customers, quotations, analytics, and package pages will then be available

## API Routes
- `GET/POST /api/packages`
- `PUT/DELETE /api/packages/[id]`
- `GET/POST /api/customers`
- `GET /api/customers/[id]/quotes`
- `GET/POST /api/quotes`
- `PUT /api/quotes/[id]`
- `POST /api/calculator`
