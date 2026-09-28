-- Crop rotation: each planting (one per plot and harvest year) also keeps its key dates,
-- the planned yield and a note. Safe to run again: columns and checks are added or replaced in place.

alter table public.plantings add column if not exists work_start_on date;
alter table public.plantings add column if not exists sown_on date;
alter table public.plantings add column if not exists harvest_on date;
-- Kilograms per hectare; the app shows it as centners per hectare or kilograms per sotka.
alter table public.plantings add column if not exists planned_yield_kg_per_ha double precision;
alter table public.plantings add column if not exists note text;

alter table public.plantings drop constraint if exists plantings_planned_yield_range;
alter table public.plantings add constraint plantings_planned_yield_range
  check (planned_yield_kg_per_ha is null or (planned_yield_kg_per_ha > 0 and planned_yield_kg_per_ha < 1000000));

alter table public.plantings drop constraint if exists plantings_note_length;
alter table public.plantings add constraint plantings_note_length
  check (note is null or char_length(note) <= 500);

-- Works start before sowing, and the harvest comes after it.
alter table public.plantings drop constraint if exists plantings_dates_order;
alter table public.plantings add constraint plantings_dates_order
  check (
    (work_start_on is null or sown_on is null or work_start_on <= sown_on) and
    (sown_on is null or harvest_on is null or sown_on <= harvest_on)
  );
