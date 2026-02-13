import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function SubscriptionManagement() {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles-for-subs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('user_id, email, business_name, full_name');
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const { error } = await supabase
        .from('vendor_subscriptions')
        .update({ status: 'active', started_at: now.toISOString(), expires_at: expiresAt.toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] }); toast.success('Subscription approved'); },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendor_subscriptions').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] }); toast.success('Subscription rejected'); },
    onError: () => toast.error('Failed to reject'),
  });

  const getVendorInfo = (userId: string) => profiles?.find(p => p.user_id === userId);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const pending = subscriptions?.filter(s => s.status === 'pending') || [];
  const others = subscriptions?.filter(s => s.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" /> Pending Approvals ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending subscriptions</p>
        ) : (
          <div className="space-y-3">
            {pending.map((sub) => {
              const vendor = getVendorInfo(sub.vendor_user_id);
              return (
                <Card key={sub.id} className="rounded-xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{vendor?.business_name || vendor?.full_name || vendor?.email || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{sub.payment_method === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'} • Ref: {sub.payment_reference}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(sub.created_at), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-lg" onClick={() => approveMutation.mutate(sub.id)} disabled={approveMutation.isPending}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => rejectMutation.mutate(sub.id)} disabled={rejectMutation.isPending}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">All Subscriptions</h3>
        <div className="space-y-2">
          {others.map((sub) => {
            const vendor = getVendorInfo(sub.vendor_user_id);
            return (
              <Card key={sub.id} className="rounded-xl">
                <CardContent className="p-3 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{vendor?.business_name || vendor?.email || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.expires_at ? `Expires: ${format(new Date(sub.expires_at), 'MMM d, yyyy')}` : 'No expiry set'}
                    </p>
                  </div>
                  <Badge variant={sub.status === 'active' ? 'default' : 'outline'} className="rounded-lg capitalize">
                    {sub.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
          {others.length === 0 && <p className="text-sm text-muted-foreground">No subscription history</p>}
        </div>
      </div>
    </div>
  );
}
