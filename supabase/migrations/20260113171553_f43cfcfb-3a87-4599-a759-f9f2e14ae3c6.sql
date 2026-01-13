-- Drop the view that has security definer issues
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate view with security_invoker instead
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  location,
  role,
  business_name,
  created_at
FROM public.profiles;

-- Grant select on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Create a policy to allow viewing non-sensitive fields for product vendor lookup
CREATE POLICY "Allow viewing vendor public info for products" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.vendor_id = profiles.id
    AND products.is_active = true
  )
);