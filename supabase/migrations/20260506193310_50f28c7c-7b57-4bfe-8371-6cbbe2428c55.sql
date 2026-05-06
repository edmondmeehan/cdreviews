
-- =========== ROLES ===========
create type public.app_role as enum ('admin', 'editor', 'contributor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========== PROFILES ===========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are public readable" on public.profiles
  for select using (true);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========== Shared updated_at trigger ===========
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- =========== REVIEWS ===========
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  artist text not null,
  label text not null default '—',
  format text not null default 'CD',
  genre text not null default 'Uncategorized',
  date text not null,                 -- mm.dd.yyyy
  decade text not null,               -- 1990s|2000s|2010s|2020s
  kind text not null default 'review',-- review|bnm|bnr
  score numeric(3,1) not null default 0,
  art text not null default 'art-1',
  byline text not null default 'Staff',
  read_mins int not null default 2,
  body jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  label_address text,
  contact text,
  archive_url text,
  period text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

create policy "Public reads published reviews" on public.reviews
  for select using (status = 'published');
create policy "Staff reads all reviews" on public.reviews
  for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff writes reviews" on public.reviews
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =========== FEATURES ===========
create table public.features (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kicker text,
  title text not null,
  dek text,
  hero text,
  byline text not null default 'Staff',
  body jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.features enable row level security;
create trigger features_touch before update on public.features
  for each row execute function public.touch_updated_at();

create policy "Public reads published features" on public.features
  for select using (status = 'published');
create policy "Staff reads all features" on public.features
  for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff writes features" on public.features
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =========== LISTS ===========
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  dek text,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lists enable row level security;
create trigger lists_touch before update on public.lists
  for each row execute function public.touch_updated_at();

create policy "Public reads published lists" on public.lists
  for select using (status = 'published');
create policy "Staff reads all lists" on public.lists
  for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff writes lists" on public.lists
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =========== CONTRIBUTORS (masthead) ===========
create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Contributor',
  bio text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.contributors enable row level security;
create trigger contributors_touch before update on public.contributors
  for each row execute function public.touch_updated_at();

create policy "Public reads contributors" on public.contributors
  for select using (true);
create policy "Staff writes contributors" on public.contributors
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =========== SUBSCRIBERS ===========
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  signed_up timestamptz not null default now()
);
alter table public.subscribers enable row level security;

create policy "Anyone can subscribe" on public.subscribers
  for insert with check (true);
create policy "Admins read subscribers" on public.subscribers
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete subscribers" on public.subscribers
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- helpful indexes
create index reviews_status_date_idx on public.reviews(status, date desc);
create index reviews_decade_idx on public.reviews(decade);
create index features_status_idx on public.features(status);
create index lists_status_idx on public.lists(status);
