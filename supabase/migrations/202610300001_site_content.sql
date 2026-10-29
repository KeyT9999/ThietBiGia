create table if not exists public.site_content (
  id text primary key check (id = 'primary'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant all on public.site_content to service_role;
