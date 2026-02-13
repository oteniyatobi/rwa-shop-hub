
-- Vendor subscriptions table
CREATE TABLE public.vendor_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled
  amount NUMERIC NOT NULL DEFAULT 1999,
  currency TEXT NOT NULL DEFAULT 'RWF',
  payment_method TEXT, -- mtn_momo, airtel_money
  payment_reference TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own subscriptions
CREATE POLICY "Vendors can view own subscriptions"
ON public.vendor_subscriptions
FOR SELECT
USING (auth.uid() = vendor_user_id);

-- Vendors can insert their own subscriptions (payment initiation)
CREATE POLICY "Vendors can create own subscriptions"
ON public.vendor_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = vendor_user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
ON public.vendor_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_vendor_subscriptions_updated_at
BEFORE UPDATE ON public.vendor_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if subscriptions are required (100+ users)
CREATE OR REPLACE FUNCTION public.is_subscription_required()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT count(*) FROM public.profiles) >= 100
$$;

-- Function to check if a vendor has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendor_subscriptions
    WHERE vendor_user_id = _user_id
      AND status = 'active'
      AND expires_at > now()
  )
$$;
