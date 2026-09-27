-- Numbered rows on a plot. A row keeps its number when replanted; each
-- variety gets a new row version so old harvest entries keep their history.
create table if not exists public.plot_rows (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  row_number integer not null check (row_number between 1 and 200),
  variety text check (variety is null or char_length(trim(variety)) between 1 and 60),
  planted_year integer check (planted_year is null or planted_year between 2000 and 2100),
  ended_year integer check (ended_year is null or ended_year between 2000 and 2100),
  created_at timestamptz not null default now(),
  check ((variety is null) = (planted_year is null)),
  check (ended_year is null or (planted_year is not null and ended_year >= planted_year))
);

create unique index if not exists plot_rows_active_number_idx
  on public.plot_rows (field_id, row_number) where ended_year is null;
create index if not exists plot_rows_owner_idx on public.plot_rows (owner_id);

alter table public.plot_rows enable row level security;
revoke all on public.plot_rows from anon;
grant select, insert, update, delete on public.plot_rows to authenticated;

drop policy if exists "plot_rows_select_own" on public.plot_rows;
create policy "plot_rows_select_own" on public.plot_rows for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "plot_rows_insert_own" on public.plot_rows;
create policy "plot_rows_insert_own" on public.plot_rows for insert to authenticated
  with check (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid()))
  );

drop policy if exists "plot_rows_update_own" on public.plot_rows;
create policy "plot_rows_update_own" on public.plot_rows for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid()))
  );

drop policy if exists "plot_rows_delete_own" on public.plot_rows;
create policy "plot_rows_delete_own" on public.plot_rows for delete to authenticated
  using ((select auth.uid()) = owner_id);
