-- One-time cleanup after the initial Journal schema migration.
-- Run this only if you want to start with an empty Journal collection.

delete from public.journal_posts;
