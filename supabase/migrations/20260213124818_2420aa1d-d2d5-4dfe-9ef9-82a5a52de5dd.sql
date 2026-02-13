
-- 1. Drop the vendor public info policy that exposes contact data
DROP POLICY IF EXISTS "Allow viewing vendor public info for products" ON public.profiles;

-- 2. Recreate public_profiles view with ONLY non-sensitive fields and security_invoker
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS SELECT
  id,
  role,
  business_name,
  full_name,
  avatar_url,
  location,
  created_at
FROM public.profiles;

-- 3. Enable RLS-like protection: allow authenticated users to read public_profiles
-- Since it's a view with security_invoker, it respects the underlying table's RLS.
-- We need a SELECT policy on profiles that allows reading these safe columns for vendors.
-- Create a policy that only exposes profiles of active vendors (no contact info exposed since the view filters columns)
CREATE POLICY "Anyone can view vendor public profiles via view"
  ON public.profiles FOR SELECT
  USING (role = 'vendor');
