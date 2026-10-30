alter table public.booking_orders
  add column if not exists progress_status text not null default 'new',
  add column if not exists progress_note text not null default '',
  add column if not exists progress_updated_at timestamptz,
  add column if not exists progress_updated_by_member_id text,
  add column if not exists admin_progress_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_orders_progress_status_check'
      and conrelid = 'public.booking_orders'::regclass
  ) then
    alter table public.booking_orders
      add constraint booking_orders_progress_status_check
      check (progress_status in ('new', 'in_progress', 'completed'));
  end if;
end $$;
