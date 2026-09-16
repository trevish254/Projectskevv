-- Services CMS foundation.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.service_posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  description text not null default '',
  scope text not null default '',
  timeline text not null default '',
  image text,
  application_title text not null default '',
  application_description text not null default '',
  application_visuals jsonb not null default '[]'::jsonb,
  detail1_title text not null default '',
  detail1_description text not null default '',
  detail1_image text,
  detail2_title text not null default '',
  detail2_description text not null default '',
  detail2_image text,
  detail3_title text not null default '',
  detail3_description text not null default '',
  detail3_image text,
  feature_title text not null default '',
  feature_text text not null default '',
  feature_image text,
  website_image text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists service_posts_status_idx on public.service_posts (status);
create index if not exists service_posts_published_at_idx on public.service_posts (published_at desc);

drop trigger if exists service_posts_set_updated_at on public.service_posts;
create trigger service_posts_set_updated_at
before update on public.service_posts
for each row execute function public.set_updated_at();

insert into public.service_posts (
  id, title, slug, status, description, scope, timeline, image,
  application_title, application_description, application_visuals,
  detail1_title, detail1_description, detail1_image,
  detail2_title, detail2_description, detail2_image,
  detail3_title, detail3_description, detail3_image,
  feature_title, feature_text, feature_image, website_image, published_at
)
values
(
  'branding', 'Branding', 'branding', 'published',
  'Distinctive identities built to make your brand clearer, more memorable, and ready to grow.',
  'Brand identity', '2–4 weeks',
  'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp',
  'BRAND APPLICATION', 'Translating your core values into tangible brand applications for print and digital channels.',
  '["https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp", "https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png", "https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png"]'::jsonb,
  'LOGO SYSTEM & USAGE', 'A flexible logo system that keeps every brand touchpoint recognisable and consistent.', 'https://framerusercontent.com/images/3reGuWpWiARbmfYlToDFtUzhTc.png',
  'TYPOGRAPHY & COLOR PALETTE', 'Expressive type, colour, and layout rules that give the identity a clear visual voice.', 'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png',
  'VOICE & TONE GUIDELINES', 'A memorable verbal system for every brand touchpoint, from launch campaigns to daily communications.', 'https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png',
  'ONE SYSTEM, EVERY TOUCHPOINT', 'We turn the core brand idea into a practical visual system that stays consistent across digital, print, packaging, and campaigns.', 'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp', 'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp', timezone('utc', now())
),
(
  'photography-videography', 'Photography / Videography', 'photography-videography', 'published',
  'Visual stories with a clear point of view, shaped for campaigns, products, and people.',
  'Campaigns and visual storytelling', '1–3 weeks',
  'https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png',
  'VISUAL STORYTELLING', 'From the first frame to the final edit, we create imagery that gives a brand a distinctive point of view.',
  '["https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png", "https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png", "https://framerusercontent.com/images/3reGuWpWiARbmfYlToDFtUzhTc.png"]'::jsonb,
  'CONCEPT & ART DIRECTION', 'We define the visual idea, references, styling, and shot language before production begins.', 'https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png',
  'PRODUCTION & SHOOTING', 'A focused production process that brings the concept to life with care, pace, and intention.', 'https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png',
  'EDITING & DELIVERY', 'Colour, pacing, retouching, and final exports prepared for every channel and format.', 'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png',
  'IMAGES WITH A POINT OF VIEW', 'We make visual work that feels immediate, considered, and unmistakably connected to the brand behind it.', 'https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png', 'https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png', timezone('utc', now())
),
(
  'web-development', 'Web Development', 'web-development', 'published',
  'Digital experiences made to move people, communicate clearly, and perform beautifully.',
  'Web design and development', '3–6 weeks',
  'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png',
  'DIGITAL EXPERIENCE', 'We combine thoughtful interaction design with reliable implementation to make websites people enjoy using.',
  '["https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png", "https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp", "https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png"]'::jsonb,
  'STRUCTURE & CONTENT', 'A clear information architecture gives every page a job and every message a place to land.', 'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png',
  'INTERACTION & MOTION', 'Responsive details and purposeful motion make the experience feel alive without getting in the way.', 'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp',
  'BUILD & LAUNCH', 'A dependable, accessible build that is tested across devices and ready for the real world.', 'https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png',
  'CLARITY THAT CONVERTS', 'The best digital experiences make the next step feel obvious. We build the system that gets people there.', 'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png', 'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png', timezone('utc', now())
),
(
  'modeling', 'Modeling', 'modeling', 'published',
  'A considered approach to casting, styling, and directing people so every image feels natural, expressive, and on-brand.',
  'Casting and talent direction', '1–2 weeks',
  'https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png',
  'CASTING & DIRECTION', 'We bring together the right people, mood, styling, and direction for a believable visual world.',
  '["https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png", "https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png", "https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png"]'::jsonb,
  'TALENT & CASTING', 'Thoughtful casting helps the audience recognise themselves in the story and the brand.', 'https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png',
  'STYLING & SETUP', 'We shape the visual details around the person, the product, and the feeling the work needs to carry.', 'https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png',
  'DIRECTION ON SET', 'Clear, collaborative direction creates images that feel confident rather than overworked.', 'https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png',
  'PEOPLE MAKE THE STORY', 'The strongest visual stories feel human first. We create the conditions for natural, memorable performances.', 'https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png', 'https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png', timezone('utc', now())
)
on conflict (id) do update set
  title = excluded.title, slug = excluded.slug, status = excluded.status, description = excluded.description,
  scope = excluded.scope, timeline = excluded.timeline, image = excluded.image,
  application_title = excluded.application_title, application_description = excluded.application_description, application_visuals = excluded.application_visuals,
  detail1_title = excluded.detail1_title, detail1_description = excluded.detail1_description, detail1_image = excluded.detail1_image,
  detail2_title = excluded.detail2_title, detail2_description = excluded.detail2_description, detail2_image = excluded.detail2_image,
  detail3_title = excluded.detail3_title, detail3_description = excluded.detail3_description, detail3_image = excluded.detail3_image,
  feature_title = excluded.feature_title, feature_text = excluded.feature_text, feature_image = excluded.feature_image, website_image = excluded.website_image,
  published_at = excluded.published_at;

alter table public.service_posts disable row level security;
grant select, insert, update, delete on table public.service_posts to anon, authenticated;
