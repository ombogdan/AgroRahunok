-- A user profile only; Firebase Auth keeps credentials and the actual session.
create table if not exists public.app_users (
  uid text primary key,
  display_name text,
  email text,
  photo_url text,
  provider_id text,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;
revoke all on public.app_users from anon;
grant select, insert, update on public.app_users to authenticated;

create policy "app_users_select_own"
  on public.app_users for select to authenticated
  using (uid = (select auth.jwt()->>'sub'));

create policy "app_users_insert_own"
  on public.app_users for insert to authenticated
  with check (uid = (select auth.jwt()->>'sub'));

create policy "app_users_update_own"
  on public.app_users for update to authenticated
  using (uid = (select auth.jwt()->>'sub'))
  with check (uid = (select auth.jwt()->>'sub'));
