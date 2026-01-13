-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure profile viewing policy - only show non-sensitive info publicly
-- Users can see full details of their own profile
CREATE POLICY "Users can view their own full profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Create a view for public profile info (non-sensitive fields only)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Update products policy to allow viewing vendor info through the relationship
-- but only non-sensitive fields
DROP POLICY IF EXISTS "Vendors can view their own inactive products" ON public.products;

CREATE POLICY "Vendors can view all their products" 
ON public.products FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = products.vendor_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Enable leaked password protection
-- Note: This is configured via Supabase auth settings