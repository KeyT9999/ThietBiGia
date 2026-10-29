create table if not exists public.member_accounts (
  member_id text primary key,
  username text not null,
  password_hash text not null,
  is_enabled boolean not null default true,
  session_version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_accounts_username_format check (username ~ '^[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$')
);

create unique index if not exists member_accounts_username_unique
  on public.member_accounts (lower(username));

alter table public.member_accounts enable row level security;

revoke all on public.member_accounts from anon, authenticated;
grant all on public.member_accounts to service_role;
