-- Migration for existing databases:
-- 1) remove star-based rating from tasks
-- 2) add recurrence support for repetitive tasks

ALTER TABLE public.tasks
  DROP COLUMN IF EXISTS rating;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'none'
  CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly'));
