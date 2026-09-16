-- Homepage brand settings used by the shared navbar and footer.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.home_settings (
  id text primary key,
  logo_text text not null default 'Projectskevv',
  social_links jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists home_settings_status_idx on public.home_settings (status);

drop trigger if exists home_settings_set_updated_at on public.home_settings;
create trigger home_settings_set_updated_at
before update on public.home_settings
for each row execute function public.set_updated_at();

insert into public.home_settings (id, logo_text, social_links, status, published_at)
values (
  'global',
  'Projectskevv',
  '[{"label":"Be","url":"#contact"},{"label":"◉","url":"#contact"},{"label":"𝕏","url":"#contact"},{"label":"in","url":"#contact"}]'::jsonb,
  'published',
  timezone('utc', now())
)
on conflict (id) do update set
  logo_text = excluded.logo_text,
  social_links = excluded.social_links,
  status = excluded.status,
  published_at = excluded.published_at;

alter table public.home_settings disable row level security;
grant select, insert, update, delete on table public.home_settings to anon, authenticated;
