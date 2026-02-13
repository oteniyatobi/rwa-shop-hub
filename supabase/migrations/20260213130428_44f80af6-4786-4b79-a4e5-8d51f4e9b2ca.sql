
DROP VIEW IF EXISTS public.public_profiles;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
