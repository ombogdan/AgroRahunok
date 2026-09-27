-- Personal quantity units such as "відро = 5 кг". Records keep a snapshot of the
-- conversion, so later unit changes never rewrite historical harvest or sale totals.
create table if not exists public.quantity_units (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 30),
  kilograms_per_unit numeric(12, 3) not null check (kilograms_per_unit > 0),
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create index if not exists quantity_units_owner_idx on public.quantity_units (owner_id);
alter table public.quantity_units enable row level security;
revoke all on public.quantity_units from anon;
grant select, insert, update, delete on public.quantity_units to authenticated;

drop policy if exists "quantity_units_select_own" on public.quantity_units;
create policy "quantity_units_select_own" on public.quantity_units for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "quantity_units_insert_own" on public.quantity_units;
create policy "quantity_units_insert_own" on public.quantity_units for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "quantity_units_update_own" on public.quantity_units;
create policy "quantity_units_update_own" on public.quantity_units for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "quantity_units_delete_own" on public.quantity_units;
create policy "quantity_units_delete_own" on public.quantity_units for delete to authenticated
  using ((select auth.uid()) = owner_id);
