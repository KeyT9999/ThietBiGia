create table if not exists public.booking_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null,
  contact_phone text,
  contact_zalo text,
  contact_email text,
  date_info text not null default '',
  services jsonb not null default '[]'::jsonb,
  selected_crew_slugs text[] not null default '{}',
  project_ref text,
  brief text not null default '',
  assigned_member_id text,
  acceptance_status text not null default 'pending'
    check (acceptance_status in ('pending', 'accepted', 'declined')),
  contact_status text not null default 'not_contacted'
    check (contact_status in ('not_contacted', 'contacted')),
  contacted_at timestamptz,
  contacted_by_member_id text
);

create index if not exists booking_orders_created_at_idx
  on public.booking_orders (created_at desc);

create index if not exists booking_orders_assigned_member_idx
  on public.booking_orders (assigned_member_id, created_at desc);

alter table public.booking_orders enable row level security;
revoke all on public.booking_orders from anon, authenticated;
grant all on public.booking_orders to service_role;
