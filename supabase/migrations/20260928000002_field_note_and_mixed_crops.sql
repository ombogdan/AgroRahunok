-- A note on each plot, and several crops sharing one plot in a season (potatoes on 10 sotok and
-- onions on 2). Safe to run again.
alter table public.fields add column if not exists note text;

alter table public.fields drop constraint if exists fields_note_length;
alter table public.fields add constraint fields_note_length
  check (note is null or char_length(note) <= 500);

-- A planting's own crop, variety and area stay its main crop; the other crops of the same plot and
-- season are listed here as [{"crop": …, "variety": …, "areaM2": …}].
alter table public.plantings add column if not exists extra_crops jsonb not null default '[]'::jsonb;

alter table public.plantings drop constraint if exists plantings_extra_crops_array;
alter table public.plantings add constraint plantings_extra_crops_array
  check (jsonb_typeof(extra_crops) = 'array');
