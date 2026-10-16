-- Add editable Design Challenge content and its two images to project posts.
-- Run this migration in the Supabase SQL Editor after migration 013.

alter table public.project_posts
  add column if not exists design_challenge jsonb not null default '{}'::jsonb;

comment on column public.project_posts.design_challenge is
  'Design challenge content with title, prompt, questions array, and two image URLs.';

update public.project_posts
set design_challenge = jsonb_build_object(
  'title', 'Design Challenge',
  'prompt', 'How might we build a scalable, playful platform that:',
  'questions', jsonb_build_array(
    'Onboards mentors quickly and securely, with minimal setup friction?',
    'Guides students through intuitive, character-led lessons despite low digital literacy.',
    'Facilitates scheduling and session management without heavy development resources?',
    'Fosters an ongoing community and portfolio development in a no-code MVP environment?'
  ),
  'images', jsonb_build_array(gallery_urls->>0, gallery_urls->>1)
)
where slug = 'beach-shoot' and design_challenge = '{}'::jsonb;
