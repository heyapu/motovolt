-- =============================================================
-- MOTOVOLT ACCESSORIES STORE — schema v2
-- Supabase = database only. Auth lives in Kinde.
-- All writes go through Next.js API routes using the service role.
-- =============================================================

-- ---------- ADMINS (authorization; Kinde handles authentication) ----------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin' check (role in ('superadmin', 'admin')),
  added_by text,                 -- email of the admin who added them
  created_at timestamptz not null default now()
);

-- ---------- MODELS (URBN, M7, KIVO, HUM, +future) ----------
create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  banner_title text,
  banner_image text,             -- ImageKit URL
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS (independent of models) ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  dimension text,
  price numeric(10,2) not null,
  stock int not null default 0,
  image text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PRODUCT <-> MODEL (many-to-many) ----------
create table if not exists public.product_models (
  product_id uuid references public.products (id) on delete cascade,
  model_id uuid references public.models (id) on delete cascade,
  primary key (product_id, model_id)
);

-- ---------- VARIANTS (Color with required hex swatch) ----------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,            -- "Color"
  value text not null,           -- "Black"
  hex text not null check (hex ~* '^#([0-9a-f]{3}|[0-9a-f]{6})$'),
  price_override numeric(10,2),  -- null = inherit product price
  stock int not null default 0,
  image text,                    -- optional variant-specific ImageKit URL
  sort_order int not null default 0
);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  rzp_order_id text unique,      -- Razorpay order id
  rzp_payment_id text,
  status text not null default 'PENDING'
    check (status in ('PENDING','PAID','FAILED')),
  amount numeric(10,2) not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address jsonb not null,        -- {line1, line2, city, state, pincode}
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  variant_id uuid references public.product_variants (id),
  title text not null,           -- snapshot at purchase time
  variant_label text,            -- "Color: Orange"
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);

-- ---------- RLS ----------
-- Anon key can only READ the public catalog. Admins/orders are service-role only.
alter table public.admins           enable row level security;
alter table public.models           enable row level security;
alter table public.products         enable row level security;
alter table public.product_models   enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;

create policy "public read models" on public.models
  for select using (is_active);
create policy "public read products" on public.products
  for select using (is_active);
create policy "public read product_models" on public.product_models
  for select using (true);
create policy "public read variants" on public.product_variants
  for select using (true);
-- (no policies on admins / orders / order_items = anon fully locked out;
--  the service role bypasses RLS in API routes)

-- ---------- STOCK DECREMENT (idempotent-safe helpers) ----------
create or replace function public.decrement_product_stock(p_id uuid, qty int)
returns void language sql security definer set search_path = public as $$
  update public.products set stock = greatest(stock - qty, 0) where id = p_id;
$$;

create or replace function public.decrement_variant_stock(v_id uuid, qty int)
returns void language sql security definer set search_path = public as $$
  update public.product_variants set stock = greatest(stock - qty, 0) where id = v_id;
$$;

-- ---------- SEED ----------
insert into public.models (name, slug, banner_title, sort_order) values
  ('URBN', 'urbn', 'Everything Your Ride Needs.', 0),
  ('M7',   'm7',   'Gear Up Your M7.', 1),
  ('KIVO', 'kivo', 'Accessories Built For KIVO.', 2),
  ('HUM',  'hum',  'Make Every HUM Ride Count.', 3)
on conflict (slug) do nothing;

-- First superadmin — CHANGE THE EMAIL, then they sign in via Kinde with it.
insert into public.admins (email, role, added_by) values
  ('supriyo.mahato@motovolt.co', 'superadmin', 'seed')
on conflict (email) do nothing;
