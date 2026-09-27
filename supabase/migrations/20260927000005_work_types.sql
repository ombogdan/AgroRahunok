-- Keep older work records valid while allowing the expanded work picker to sync.
alter table public.records
  drop constraint if exists records_work_type_check;

alter table public.records
  add constraint records_work_type_check
  check (work_type is null or work_type in (
    'oranka', 'dysk', 'borona', 'kult', 'posiv', 'posadka', 'sap',
    'obpr', 'pidzh', 'poliv', 'mulch', 'obriz', 'zbir', 'inshe'
  ));
