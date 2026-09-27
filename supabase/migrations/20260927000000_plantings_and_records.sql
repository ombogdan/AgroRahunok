-- Work journal: what grows on a plot in a season (plantings) and everything done or earned there (records).
-- Safe to run again: tables, indexes, policies and the trigger are created or replaced in place.

-- One planting per plot and season (the harvest year). Records create it automatically.
create table if not exists public.plantings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  crop text check (crop is null or char_length(crop) between 1 and 60),
  season integer not null check (season between 2000 and 2100),
  area_m2 double precision check (area_m2 > 0),
  perennial boolean not null default false,
  created_at timestamptz not null default now(),
  unique (field_id, season)
);

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  planting_id uuid references public.plantings(id) on delete set null,
  kind text not null check (kind in ('work', 'harvest', 'sale', 'other')),
  work_type text check (work_type is null or work_type in
    ('oranka', 'kult', 'posiv', 'sap', 'obpr', 'pidzh', 'poliv', 'obriz', 'zbir', 'inshe')),
  occurred_on date not null default current_date,
  -- The harvest year: autumn work under winter crops belongs to the next year's season.
  season integer not null check (season between 2000 and 2100),
  -- Hryvnias × 100. Expenses are negative, income positive; empty means "not filled in yet".
  amount_kopecks bigint,
  quantity_kg double precision check (quantity_kg is null or quantity_kg > 0),
  note text check (note is null or char_length(note) <= 500),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now(),
  check (kind <> 'work' or work_type is not null),
  check (kind <> 'work' or amount_kopecks is null or amount_kopecks <= 0)
);

create index if not exists plantings_field_id_idx on public.plantings (field_id);
create index if not exists records_owner_date_idx on public.records (owner_id, occurred_on desc);
create index if not exists records_field_id_idx on public.records (field_id);

alter table public.plantings enable row level security;
alter table public.records enable row level security;
revoke all on public.plantings from anon;
revoke all on public.records from anon;
grant select, insert, update, delete on public.plantings to authenticated;
grant select, insert, update, delete on public.records to authenticated;

-- Rows belong to the signed-in user, and only to their own plots.
drop policy if exists "plantings_select_own" on public.plantings;
create policy "plantings_select_own"
  on public.plantings for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "plantings_insert_own" on public.plantings;
create policy "plantings_insert_own"
  on public.plantings for insert to authenticated
  with check (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid()))
  );

drop policy if exists "plantings_update_own" on public.plantings;
create policy "plantings_update_own"
  on public.plantings for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid()))
  );

drop policy if exists "plantings_delete_own" on public.plantings;
create policy "plantings_delete_own"
  on public.plantings for delete to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "records_select_own" on public.records;
create policy "records_select_own"
  on public.records for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "records_insert_own" on public.records;
create policy "records_insert_own"
  on public.records for insert to authenticated
  with check (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid()))
  );

drop policy if exists "records_update_own" on public.records;
create policy "records_update_own"
  on public.records for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid()))
  );

drop policy if exists "records_delete_own" on public.records;
create policy "records_delete_own"
  on public.records for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- Every record points at the planting of its plot and season; the first record of a season creates it
-- from the plot's current crop and area. Runs with the caller's rights, so RLS still applies.
create or replace function public.link_record_planting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.plantings (owner_id, field_id, crop, season, area_m2, perennial)
  select
    f.owner_id,
    f.id,
    nullif(f.crop, ''),
    new.season,
    case when f.area_source = 'document' then f.document_area_m2 else f.measured_area_m2 end,
    coalesce(f.crop, '') ~* '(малин|полуниц|суниц|смородин|ожин|аґрус|агрус|виноград|лохин|яблун|груш|вишн|черешн|слив)'
  from public.fields f
  where f.id = new.field_id
  on conflict (field_id, season) do nothing;

  select p.id into new.planting_id
  from public.plantings p
  where p.field_id = new.field_id and p.season = new.season;
  return new;
end;
$$;

drop trigger if exists records_link_planting on public.records;
create trigger records_link_planting
  before insert or update of field_id, season on public.records
  for each row execute procedure public.link_record_planting();
