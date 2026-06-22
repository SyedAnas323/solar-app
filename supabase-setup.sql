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

