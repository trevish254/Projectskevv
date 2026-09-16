-- Homepage pricing plans used by the Home CMS editor.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.home_pricing (
  id text primary key,
  title text not null,
  eyebrow text not null default '',
  description text not null default '',
  price text not null default '$0',
  price_unit text not null default '/project',
  features jsonb not null default '[]'::jsonb,
  cta_label text not null default 'START PROJECT',
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists home_pricing_status_idx on public.home_pricing (status);
create index if not exists home_pricing_sort_order_idx on public.home_pricing (sort_order);

drop trigger if exists home_pricing_set_updated_at on public.home_pricing;
create trigger home_pricing_set_updated_at
before update on public.home_pricing
for each row execute function public.set_updated_at();

insert into public.home_pricing (id, title, eyebrow, description, price, price_unit, features, cta_label, is_popular, sort_order, status, published_at)
values
(
  'startup-digital-launch-kit',
  'STARTUP DIGITAL LAUNCH KIT',
  'Limited availability',
  'Ideal for brands that need regular creative work.',
  '$618', '/month',
  '["Standard website development", "AI chatbot integration", "Landing page creation", "Zoom meetings and live events"]'::jsonb,
  'START MONTHLY PLAN', false, 0, 'published', timezone('utc', now())
),
(
  'premium-digital-market-pro',
  'PREMIUM DIGITAL MARKET PRO',
  '',
  'We''ll tailor the quote to your timeline and budget.',
  '$927', '/project',
  '["Marketing video production", "Professional modelling shoot", "Advertisement campaign creation", "Social media content package"]'::jsonb,
  'START PROJECT', true, 1, 'published', timezone('utc', now())
)
on conflict (id) do update set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  price = excluded.price,
  price_unit = excluded.price_unit,
  features = excluded.features,
  cta_label = excluded.cta_label,
  is_popular = excluded.is_popular,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

alter table public.home_pricing disable row level security;
grant select, insert, update, delete on table public.home_pricing to anon, authenticated;
