-- Projects CMS foundation.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.project_posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  description text not null default '',
  body_text text not null default '',
  cover_image_url text,
  tag text not null default '',
  duration text not null default '',
  client text not null default '',
  website_url text,
  gallery_urls jsonb not null default '[]'::jsonb,
  video_url text,
  video_poster_url text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists project_posts_status_idx on public.project_posts (status);
create index if not exists project_posts_published_at_idx on public.project_posts (published_at desc);

drop trigger if exists project_posts_set_updated_at on public.project_posts;
create trigger project_posts_set_updated_at
before update on public.project_posts
for each row execute function public.set_updated_at();

-- This project is immediately visible on the public Projects page.
insert into public.project_posts (
  id, title, slug, status, description, body_text, cover_image_url,
  tag, duration, client, website_url, gallery_urls, published_at
)
values (
  'beach-shoot',
  'Beach Shoot',
  'beach-shoot',
  'published',
  'An abstract visual exploration where light, water, and color dissolve into a single atmospheric form.',
  'Explores the tension between light and darkness through a series of abstract beach captures.',
  'https://framerusercontent.com/images/64pa4deJ9c4cc4c58vzW7N0WgU.jpg?width=3500&height=2333',
  'ART DIRECTION / PHOTOGRAPHY',
  '1 day',
  'Mia Khalifa',
  'https://projectskevv.com',
  '["https://framerusercontent.com/images/1828lmWV1X8KP4ehLRXfgbmTjMs.png?width=1349&height=2400", "https://framerusercontent.com/images/TEPq34U3DUtGaXdZtpGZFrtXlI.png?width=1800&height=2400"]'::jsonb,
  timezone('utc', now())
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  body_text = excluded.body_text,
  cover_image_url = excluded.cover_image_url,
  tag = excluded.tag,
  duration = excluded.duration,
  client = excluded.client,
  website_url = excluded.website_url,
  gallery_urls = excluded.gallery_urls,
  status = excluded.status,
  published_at = excluded.published_at;

-- Direct browser CMS access, matching the Journal setup.
alter table public.project_posts disable row level security;
grant select, insert, update, delete on table public.project_posts to anon, authenticated;
