-- Journal CMS foundation
-- Run this migration in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  description text not null default '',
  content_html text not null default '',
  cover_image_url text,
  tag text not null default '',
  minutes_read integer not null default 1 check (minutes_read > 0),
  author_name text not null default '',
  author_role text not null default '',
  author_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists journal_posts_status_idx on public.journal_posts (status);
create index if not exists journal_posts_published_at_idx on public.journal_posts (published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists journal_posts_set_updated_at on public.journal_posts;
create trigger journal_posts_set_updated_at
before update on public.journal_posts
for each row execute function public.set_updated_at();

alter table public.journal_posts enable row level security;

drop policy if exists "Published journal posts are public" on public.journal_posts;
create policy "Published journal posts are public"
on public.journal_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Authenticated users can read all journal posts" on public.journal_posts;
create policy "Authenticated users can read all journal posts"
on public.journal_posts
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create journal posts" on public.journal_posts;
create policy "Authenticated users can create journal posts"
on public.journal_posts
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update journal posts" on public.journal_posts;
create policy "Authenticated users can update journal posts"
on public.journal_posts
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete journal posts" on public.journal_posts;
create policy "Authenticated users can delete journal posts"
on public.journal_posts
for delete
to authenticated
using (true);

/* Optional starter record matching the current Journal detail page.
insert into public.journal_posts (
  title,
  slug,
  status,
  description,
  content_html,
  cover_image_url,
  tag,
  minutes_read,
  author_name,
  author_role,
  author_image_url,
  published_at
)
values (
  'Texture as a Design Decision Matter',
  'texture-as-a-design-decision',
  'published',
  'Texture can make digital work feel tactile, human, and lived-in, but it can also weaken hierarchy fast.',
  '<p>Texture works when it carries a purpose. It can reduce the “too perfect” feeling of digital surfaces, soften sharp compositions, and introduce a quiet sense of depth.</p><p>The problem is that texture is persuasive even when it is wrong. Type, spacing, and composition should lead.</p><h2>WHERE TEXTURE ACTUALLY HELPS</h2><p>Texture tends to shine in controlled areas: backgrounds, large image blocks, or sections that exist to set tone.</p>',
  'https://framerusercontent.com/images/q5tU6RCU1nwpJZHJIht3hghY.png',
  'CRAFT',
  4,
  'JONAS KELLER',
  'Designer',
  'https://framerusercontent.com/images/v1GP5HmUip1qJrAvJFmQDDbSFVM.png',
  timezone('utc', now())
)
on conflict (slug) do nothing; */
