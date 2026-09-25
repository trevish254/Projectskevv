-- Homepage pricing section settings used by the CMS editor.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.home_pricing_settings (
  id text primary key,
  title text not null default 'PRICING',
  description text not null default '',
  item_count integer not null default 0 check (item_count >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists home_pricing_settings_set_updated_at on public.home_pricing_settings;
create trigger home_pricing_settings_set_updated_at
before update on public.home_pricing_settings
for each row execute function public.set_updated_at();

insert into public.home_pricing_settings (id, title, description, item_count, status, published_at)
values (
  'global',
  'PRICING',
  'We keep pricing clear and fully transparent. Final cost depends on scope and timeline.',
  2,
  'published',
  timezone('utc', now())
)
on conflict (id) do nothing;

alter table public.home_pricing_settings disable row level security;
grant select, insert, update, delete on table public.home_pricing_settings to anon, authenticated;

-- Query used by the CMS Publish action:
-- insert into public.home_pricing_settings (id, title, description, item_count, status, published_at)
-- values ('global', 'PRICING', 'Section description', 2, 'published', timezone('utc', now()))
-- on conflict (id) do update set
--   title = excluded.title,
--   description = excluded.description,
--   item_count = excluded.item_count,
--   status = excluded.status,
--   published_at = excluded.published_at;
