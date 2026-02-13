
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  business_name,
  location,
  role,
  created_at,
  is_verified
FROM public.profiles
WHERE role = 'vendor';

CREATE OR REPLACE FUNCTION public.handle_verification_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.profiles SET is_verified = true WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_verification_approved
AFTER UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_verification_approved();
