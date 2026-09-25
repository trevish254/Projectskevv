-- Allow the CMS to manage journal posts without a sign-in session.
-- Run this once in the Supabase SQL Editor if journal saving returns 401/403.

drop policy if exists "Anonymous users can read all journal posts" on public.journal_posts;
create policy "Anonymous users can read all journal posts"
on public.journal_posts
for select
to anon
using (true);

drop policy if exists "Anonymous users can create journal posts" on public.journal_posts;
create policy "Anonymous users can create journal posts"
on public.journal_posts
for insert
to anon
with check (true);

drop policy if exists "Anonymous users can update journal posts" on public.journal_posts;
create policy "Anonymous users can update journal posts"
on public.journal_posts
for update
to anon
using (true)
with check (true);

drop policy if exists "Anonymous users can delete journal posts" on public.journal_posts;
create policy "Anonymous users can delete journal posts"
on public.journal_posts
for delete
to anon
using (true);