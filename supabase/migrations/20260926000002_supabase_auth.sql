-- Sign-in moved from Firebase to Supabase Auth (Google ID token), and plots are written straight
-- to the database. The Firebase-based tables from the two previous migrations never received rows
-- (their requests were rejected), so they are replaced rather than migrated.
-- Safe to run again: it only drops the old Firebase-era tables and recreates policies in place.
drop table if exists public.app_users;

-- Drop `fields` only in its old Firebase shape (owner_uid text); the new table keeps its rows.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fields' and column_name = 'owner_uid'
  ) then
    drop table public.fields;
  end if;
end $$;

-- One profile per Supabase user, created automatically on first sign-in.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Users who signed in before this migration ran get their profile too.
insert into public.profiles (id, display_name, email, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''),
  email,
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  type text not null check (type in ('field', 'garden', 'berries', 'orchard', 'greenhouse')),
  crop text,
  document_area_m2 double precision check (document_area_m2 > 0),
  measured_area_m2 double precision check (measured_area_m2 > 0),
  area_source text not null check (area_source in ('document', 'measured')),
  polygon jsonb not null default '[]'::jsonb check (jsonb_typeof(polygon) = 'array'),
  created_at timestamptz not null default now(),
  -- The area used in totals must actually be filled in.
  check (
    (area_source = 'document' and document_area_m2 is not null) or
    (area_source = 'measured' and measured_area_m2 is not null)
  )
);

create index if not exists fields_owner_id_idx on public.fields (owner_id);

alter table public.fields enable row level security;
revoke all on public.fields from anon;
grant select, insert, update, delete on public.fields to authenticated;

drop policy if exists "fields_select_own" on public.fields;
create policy "fields_select_own"
  on public.fields for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "fields_insert_own" on public.fields;
create policy "fields_insert_own"
  on public.fields for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "fields_update_own" on public.fields;
create policy "fields_update_own"
  on public.fields for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "fields_delete_own" on public.fields;
create policy "fields_delete_own"
  on public.fields for delete to authenticated
  using ((select auth.uid()) = owner_id);
