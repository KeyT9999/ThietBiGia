create table if not exists public.partner_organization_proposals (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  member_name text not null,
  name text not null check (char_length(name) between 1 and 180),
  logo text not null default '',
  website text not null default '',
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text not null default '',
  approved_organization_id text,
  reviewed_by text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists partner_organization_proposals_status_created_idx
  on public.partner_organization_proposals (status, created_at desc);

create index if not exists partner_organization_proposals_member_created_idx
  on public.partner_organization_proposals (member_id, created_at desc);

alter table public.partner_organization_proposals enable row level security;

revoke all on public.partner_organization_proposals from anon, authenticated;
grant all on public.partner_organization_proposals to service_role;
