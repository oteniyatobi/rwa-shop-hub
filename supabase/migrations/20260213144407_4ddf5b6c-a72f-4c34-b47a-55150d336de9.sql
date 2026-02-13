
-- Update products public visibility to check subscription when required
DROP POLICY "Products are viewable by everyone" ON public.products;

CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (
  is_active = true 
  AND is_blocked = false 
  AND (
    NOT is_subscription_required() 
    OR has_active_subscription(
      (SELECT user_id FROM profiles WHERE id = products.vendor_id)
    )
  )
);
