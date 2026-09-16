-- Homepage media links used by the visual CMS editor.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.home_media (
  id text primary key,
  media_url text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists home_media_status_idx on public.home_media (status);

drop trigger if exists home_media_set_updated_at on public.home_media;
create trigger home_media_set_updated_at
before update on public.home_media
for each row execute function public.set_updated_at();

-- Direct browser CMS access, matching the existing collections.
alter table public.home_media disable row level security;
grant select, insert, update, delete on table public.home_media to anon, authenticated;
