-- Public project and service media uploaded from the admin editor.
-- Run this migration in the Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'projectskevv-media',
  'projectskevv-media',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Projectskevv media uploads" on storage.objects;
create policy "Projectskevv media uploads"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'projectskevv-media');