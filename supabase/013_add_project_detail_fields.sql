-- Add editable project insight rows and the large overview image.
-- Run this migration in the Supabase SQL Editor before using the new admin fields.

alter table public.project_posts
  add column if not exists key_insights jsonb not null default '[]'::jsonb,
  add column if not exists overview_image_url text;

comment on column public.project_posts.key_insights is
  'Array of project insight objects with subtitle and text properties.';
comment on column public.project_posts.overview_image_url is
  'Image shown below the project key insights.';

update public.project_posts
set key_insights = '[
  {"subtitle":"Student Context","text":"Learners aged 8–15 lacked structured access to English practice and design tools but showed high motivation when content was hands-on and culturally relatable."},
  {"subtitle":"Mentor Needs","text":"Volunteers needed a frictionless signup, clear onboarding, and simple scheduling tools to manage sessions across time zones."},
  {"subtitle":"Technical Constraints","text":"Predominant mobile usage and variable internet speeds required lightweight pages, concise media, and offline-friendly components."}
]'::jsonb
where slug = 'beach-shoot' and key_insights = '[]'::jsonb;

