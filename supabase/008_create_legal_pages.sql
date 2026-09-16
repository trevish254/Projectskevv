-- Editable Legal/Contact page content used by the admin inline editor.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.legal_pages (
  id text primary key,
  content_html text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists legal_pages_status_idx on public.legal_pages (status);

drop trigger if exists legal_pages_set_updated_at on public.legal_pages;
create trigger legal_pages_set_updated_at
before update on public.legal_pages
for each row execute function public.set_updated_at();

insert into public.legal_pages (id, content_html, status)
values ('global', '', 'draft')
on conflict (id) do nothing;

alter table public.legal_pages disable row level security;
grant select, insert, update, delete on table public.legal_pages to anon, authenticated;
