-- Other income and expenses may belong to the whole farm instead of one plot.
alter table public.records alter column field_id drop not null;

alter table public.records drop constraint if exists records_field_required;
alter table public.records add constraint records_field_required
  check (kind = 'other' or field_id is not null);

drop policy if exists "records_insert_own" on public.records;
create policy "records_insert_own" on public.records for insert to authenticated
  with check (
    (select auth.uid()) = owner_id and
    (field_id is null or exists (
      select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())
    ))
  );

drop policy if exists "records_update_own" on public.records;
create policy "records_update_own" on public.records for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id and
    (field_id is null or exists (
      select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())
    ))
  );

-- A general record has no planting. Plot records still link to their season's planting.
create or replace function public.link_record_planting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.field_id is null then
    new.planting_id := null;
    return new;
  end if;

  insert into public.plantings (owner_id, field_id, crop, variety, season, area_m2)
  select
    f.owner_id,
    f.id,
    nullif(f.crop, ''),
    nullif(f.variety, ''),
    new.season,
    case when f.area_source = 'document' then f.document_area_m2 else f.measured_area_m2 end
  from public.fields f
  where f.id = new.field_id
  on conflict (field_id, season) do nothing;

  select p.id into new.planting_id
  from public.plantings p
  where p.field_id = new.field_id and p.season = new.season;
  return new;
end;
$$;
