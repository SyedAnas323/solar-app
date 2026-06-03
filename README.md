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

## API Routes
- `GET/POST /api/packages`
- `PUT/DELETE /api/packages/[id]`
- `GET/POST /api/customers`
- `GET /api/customers/[id]/quotes`
- `GET/POST /api/quotes`
- `PUT /api/quotes/[id]`
- `POST /api/calculator`
