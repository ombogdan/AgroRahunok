-- Firebase UID is text (not UUID), so RLS compares it with the JWT sub claim.
create table if not exists public.fields (
  owner_uid text not null,
  id text not null,
  name text not null,
  type text not null check (type in ('field', 'garden', 'berries', 'orchard', 'greenhouse')),
  crop text,
  document_area_m2 double precision check (document_area_m2 > 0),
  measured_area_m2 double precision check (measured_area_m2 > 0),
  area_source text not null check (area_source in ('document', 'measured')),
  polygon jsonb not null default '[]'::jsonb check (jsonb_typeof(polygon) = 'array'),
  created_at timestamptz not null default now(),
  primary key (owner_uid, id)
);

alter table public.fields enable row level security;
revoke all on public.fields from anon;
grant select, insert, update, delete on public.fields to authenticated;

create policy "fields_select_own"
  on public.fields for select to authenticated
  using (owner_uid = (select auth.jwt()->>'sub'));

create policy "fields_insert_own"
  on public.fields for insert to authenticated
  with check (owner_uid = (select auth.jwt()->>'sub'));

create policy "fields_update_own"
  on public.fields for update to authenticated
  using (owner_uid = (select auth.jwt()->>'sub'))
  with check (owner_uid = (select auth.jwt()->>'sub'));

create policy "fields_delete_own"
  on public.fields for delete to authenticated
  using (owner_uid = (select auth.jwt()->>'sub'));
