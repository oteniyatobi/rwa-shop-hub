import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSubscription() {
  const { user, profile } = useAuth();

  const { data: isRequired, isLoading: loadingRequired } = useQuery({
    queryKey: ['subscription-required'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_subscription_required');
      if (error) throw error;
      return data as boolean;
    },
  });

  const { data: subscription, isLoading: loadingSub, refetch } = useQuery({
    queryKey: ['my-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('vendor_subscriptions')
        .select('*')
        .eq('vendor_user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.role === 'vendor',
  });

  const isVendor = profile?.role === 'vendor';
  const needsSubscription = isRequired === true && isVendor && !subscription;
  const hasActiveSubscription = !!subscription;

  return {
    isRequired: isRequired ?? false,
    needsSubscription,
    hasActiveSubscription,
    subscription,
    loading: loadingRequired || loadingSub,
    refetch,
  };
}
