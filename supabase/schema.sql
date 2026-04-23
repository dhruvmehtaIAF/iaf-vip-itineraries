-- IAF VIP Itineraries — database schema
-- Run this in Supabase SQL Editor after creating the project.

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type user_role as enum ('admin', 'viewer');
create type vip_category as enum ('collector', 'artist', 'press', 'sponsor', 'curator', 'gallerist', 'institution', 'other');
create type rsvp_status as enum ('not_sent', 'invited', 'accepted', 'declined', 'tentative', 'waitlist');

-- ============================================================
-- profiles: mirrors auth.users, adds role + name
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row on signup (default role = viewer)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: is current user an admin?
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- vips
-- ============================================================
create table if not exists vips (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  country text,
  category vip_category not null default 'other',
  dietary text,
  hotel text,
  flight_arrival text,
  flight_departure text,
  assigned_host_id uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vips_country_idx on vips (country);
create index if not exists vips_category_idx on vips (category);
create index if not exists vips_host_idx on vips (assigned_host_id);

-- companions (+1s)
create table if not exists companions (
  id uuid primary key default gen_random_uuid(),
  vip_id uuid not null references vips(id) on delete cascade,
  full_name text not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists companions_vip_idx on companions (vip_id);

-- ============================================================
-- events
-- ============================================================
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  start_time time,
  end_time time,
  venue text,
  dress_code text,
  capacity int,
  invite_only boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_date_idx on events (event_date);

-- ============================================================
-- invitations (VIP × Event with RSVP status)
-- ============================================================
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  vip_id uuid not null references vips(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  status rsvp_status not null default 'not_sent',
  companions_attending int not null default 0,
  responded_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vip_id, event_id)
);
create index if not exists invitations_vip_idx on invitations (vip_id);
create index if not exists invitations_event_idx on invitations (event_id);
create index if not exists invitations_status_idx on invitations (status);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vips_touch on vips;
create trigger vips_touch before update on vips
  for each row execute function touch_updated_at();

drop trigger if exists events_touch on events;
create trigger events_touch before update on events
  for each row execute function touch_updated_at();

drop trigger if exists invitations_touch on invitations;
create trigger invitations_touch before update on invitations
  for each row execute function touch_updated_at();

-- ============================================================
-- Row Level Security
-- Any authenticated user can read everything (internal app).
-- Only admins can write.
-- ============================================================
alter table profiles     enable row level security;
alter table vips         enable row level security;
alter table companions   enable row level security;
alter table events       enable row level security;
alter table invitations  enable row level security;

-- profiles: authenticated can read; admins manage; each user can see themselves
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select
  to authenticated using (true);

drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles for update
  to authenticated using (is_admin()) with check (is_admin());

drop policy if exists profiles_admin_delete on profiles;
create policy profiles_admin_delete on profiles for delete
  to authenticated using (is_admin());

-- Generic read-for-auth + write-for-admin policies
do $$
declare tbl text;
begin
  foreach tbl in array array['vips','companions','events','invitations']
  loop
    execute format('drop policy if exists %I_read on %I', tbl, tbl);
    execute format('create policy %I_read on %I for select to authenticated using (true)', tbl, tbl);

    execute format('drop policy if exists %I_admin_insert on %I', tbl, tbl);
    execute format('create policy %I_admin_insert on %I for insert to authenticated with check (is_admin())', tbl, tbl);

    execute format('drop policy if exists %I_admin_update on %I', tbl, tbl);
    execute format('create policy %I_admin_update on %I for update to authenticated using (is_admin()) with check (is_admin())', tbl, tbl);

    execute format('drop policy if exists %I_admin_delete on %I', tbl, tbl);
    execute format('create policy %I_admin_delete on %I for delete to authenticated using (is_admin())', tbl, tbl);
  end loop;
end $$;
