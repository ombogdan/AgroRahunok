-- Rows keep their crop next to the variety (raspberry «Полка», apple «Голден»): berry plots and
-- orchards no longer have one crop for the whole plot. Safe to run again.
alter table public.plot_rows add column if not exists crop text;

alter table public.plot_rows drop constraint if exists plot_rows_crop_length;
alter table public.plot_rows add constraint plot_rows_crop_length
  check (crop is null or char_length(trim(crop)) between 1 and 60);

-- Rows planted before this change take the crop their plot had.
update public.plot_rows r
set crop = trim(f.crop)
from public.fields f
where r.field_id = f.id
  and r.crop is null
  and r.variety is not null
  and char_length(trim(coalesce(f.crop, ''))) between 1 and 60;
