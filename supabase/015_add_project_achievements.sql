-- Add editable notable achievements content and its large image.
-- Run this migration in the Supabase SQL Editor after migration 014.

alter table public.project_posts
  add column if not exists notable_achievements jsonb not null default '{}'::jsonb;

comment on column public.project_posts.notable_achievements is
  'Notable achievements section with title, repeatable subtitle/text rows, and image URL.';

update public.project_posts
set notable_achievements = jsonb_build_object(
  'title', 'Notable Achievements',
  'rows', jsonb_build_array(
    jsonb_build_object('subtitle', 'Partnerships', 'text', 'Pilot involved two Phuket schools and twenty vetted volunteers, with marked improvements in student English performance. Two international schools joined to offer volunteering as part of their curricula.'),
    jsonb_build_object('subtitle', 'Comprehensive Business Model', 'text', 'Adopted a freemium model: core features free, premium resources for partners. One-for-one merchandise sales fund student access.'),
    jsonb_build_object('subtitle', 'MVP Deployment', 'text', 'Deployment ready by Summer 2025')
  ),
  'image', gallery_urls->>1
)
where slug = 'beach-shoot' and notable_achievements = '{}'::jsonb;
