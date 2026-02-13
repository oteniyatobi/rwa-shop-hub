import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, CreditCard, CheckCircle2, Clock, Phone, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function PendingPayments({ userId }: { userId: string }) {
  const { data: pendingSubs } = useQuery({
    queryKey: ['pending-subscriptions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subscriptions')
        .select('*')
        .eq('vendor_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!pendingSubs?.length) return null;

  return (
    <motion.div variants={fadeUp} className="mt-6">
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-accent" /> Pending Payments
          </h3>
          <div className="space-y-2">
            {pendingSubs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between text-sm rounded-lg bg-muted/50 p-3">
                <div>
                  <span className="font-medium">{sub.payment_method === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'}</span>
                  <span className="text-muted-foreground ml-2">Ref: {sub.payment_reference}</span>
                </div>
                <Badge variant="outline" className="rounded-lg">Pending</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Subscription() {
  const { user, profile, loading: authLoading } = useAuth();
  const { hasActiveSubscription, subscription, needsSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || subLoading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!user || profile?.role !== 'vendor') {
    navigate('/dashboard');
    return null;
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod || !paymentReference.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('vendor_subscriptions').insert({
        vendor_user_id: user.id,
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
        status: 'pending',
        amount: 1999,
        currency: 'RWF',
      });
      if (error) throw error;
      toast.success('Payment submitted! We\'ll verify and activate your subscription shortly.');
      setPaymentReference('');
      setPaymentMethod('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          {hasActiveSubscription && subscription && (
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-primary/30 shadow-xl shadow-primary/5 mb-6">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Subscription Active</h2>
                  <p className="text-muted-foreground mt-1">Your products are visible to buyers</p>
                  <div className="mt-4 text-sm">
                    <span className="text-muted-foreground">Expires: <strong className="text-foreground">{formatDate(subscription.expires_at!)}</strong></span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl border-border/50 shadow-xl shadow-primary/5">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  {hasActiveSubscription ? 'Renew Subscription' : 'Vendor Subscription'}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {needsSubscription ? 'Subscribe to keep your products visible to buyers' : 'Monthly plan to sell on the platform'}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center mb-6">
                  <p className="text-4xl font-extrabold text-primary">1,999 <span className="text-lg font-semibold">RWF</span></p>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {['Unlimited listings', 'Direct buyer contact', 'Verified badge'].map((f) => (
                      <Badge key={f} variant="secondary" className="rounded-lg text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-4 mb-6 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" /> How to Pay
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">MTN MoMo:</strong> Dial *182*8*1# → Enter merchant code → Amount: 1999 RWF</p>
                    <p><strong className="text-foreground">Airtel Money:</strong> Dial *182*8*1# → Enter merchant code → Amount: 1999 RWF</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Your payment will be verified within 24 hours
                  </p>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select payment method" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                        <SelectItem value="airtel_money">Airtel Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ref">Transaction Reference / ID</Label>
                    <Input id="ref" placeholder="e.g. TXN123456789" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="rounded-xl" />
                    <p className="text-xs text-muted-foreground">Enter the transaction ID from your MoMo/Airtel Money confirmation SMS</p>
                  </div>
                  <Button type="submit" className="w-full rounded-xl glow-primary" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Submit Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <PendingPayments userId={user.id} />
        </motion.div>
      </div>
    </Layout>
  );
}
