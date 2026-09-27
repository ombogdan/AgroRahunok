-- Variety (сорт) next to the crop: the plot keeps its current one, plantings keep one per season.
-- Safe to run again.
alter table public.fields add column if not exists variety text;
alter table public.plantings add column if not exists variety text;

alter table public.fields drop constraint if exists fields_variety_length;
alter table public.fields add constraint fields_variety_length
  check (variety is null or char_length(variety) between 1 and 60);

alter table public.plantings drop constraint if exists plantings_variety_length;
alter table public.plantings add constraint plantings_variety_length
  check (variety is null or char_length(variety) between 1 and 60);

-- The first record of a season now copies the plot's variety into the new planting as well.
-- `perennial` keeps its default (false): it will be the user's explicit choice, not guessed from the crop name.
create or replace function public.link_record_planting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
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
